"""
Equalyze — Orchestrator Agent
Master coordinator that runs the full audit pipeline.
"""

import pandas as pd
from datetime import datetime
from typing import Any

from api.models.audit import (
    Audit, AuditStatus, AgentState, AgentStatus, Severity, Finding,
)
from api.agents.twin_engine_agent import twin_engine_agent
from api.agents.governance_agent import governance_agent
from api.agents.remediation_agent import remediation_agent
from api.utils.crypto import hash_dict


class OrchestratorAgent:
    """
    Orchestrator — coordinates the full bias audit pipeline.
    
    Flow:
    1. Twin Engine: Run fairness metrics + generate counterfactual twins
    2. Governance: Map findings to regulations + score legal exposure
    3. Remediation: Generate fix strategies for each finding
    4. Finalize: Compute overall severity, write audit log
    """

    async def run_audit(self, audit: Audit, df: pd.DataFrame, schema_map):
        """Execute the complete audit pipeline."""
        schema_dict = schema_map.model_dump() if hasattr(schema_map, 'model_dump') else schema_map
        domain = audit.model_metadata.domain.value if hasattr(audit.model_metadata.domain, 'value') else str(audit.model_metadata.domain)
        jurisdictions = audit.model_metadata.jurisdiction

        self._log(audit, "audit_started", "Pipeline execution started")

        # ── Step 1: Twin Engine ────────────────
        self._update_agent(audit, "twin_engine", AgentStatus.RUNNING)
        try:
            findings = await twin_engine_agent.analyze(df, schema_dict, domain)
            audit.findings = findings
            self._update_agent(audit, "twin_engine", AgentStatus.COMPLETE)
            self._log(audit, "twin_engine_complete", f"Found {len(findings)} findings")
        except Exception as e:
            self._update_agent(audit, "twin_engine", AgentStatus.FAILED, str(e))
            self._log(audit, "twin_engine_failed", str(e))
            # Continue with empty findings rather than aborting
            audit.findings = []

        # ── Step 2: Governance ────────────────
        self._update_agent(audit, "governance", AgentStatus.RUNNING)
        try:
            for finding in audit.findings:
                if finding.severity in (Severity.AMBER, Severity.RED):
                    violations = await governance_agent.analyze_finding(
                        finding=finding,
                        domain=domain,
                        jurisdictions=jurisdictions,
                    )
                    finding.legal_violations = violations

            # Compute overall severity
            overall_severity, overall_score = governance_agent.compute_overall_severity(audit.findings)
            audit.overall_severity = overall_severity
            audit.overall_score = overall_score

            self._update_agent(audit, "governance", AgentStatus.COMPLETE)
            self._log(audit, "governance_complete", f"Overall: {overall_severity} ({overall_score})")
        except Exception as e:
            self._update_agent(audit, "governance", AgentStatus.FAILED, str(e))
            self._log(audit, "governance_failed", str(e))

        # ── Step 3: Remediation ────────────────
        self._update_agent(audit, "remediation", AgentStatus.RUNNING)
        try:
            for finding in audit.findings:
                if finding.severity in (Severity.AMBER, Severity.RED):
                    strategies = await remediation_agent.generate_strategies(
                        finding=finding,
                        domain=domain,
                        model_type=audit.model_metadata.model_type,
                    )
                    finding.remediation_strategies = strategies

            self._update_agent(audit, "remediation", AgentStatus.COMPLETE)
            self._log(audit, "remediation_complete", "Strategies generated")
        except Exception as e:
            self._update_agent(audit, "remediation", AgentStatus.FAILED, str(e))
            self._log(audit, "remediation_failed", str(e))

        # ── Step 4: Finalize ────────────────
        self._update_agent(audit, "reporting", AgentStatus.RUNNING)
        try:
            # Mark ingestion as complete (already done during upload)
            self._update_agent(audit, "ingestion", AgentStatus.COMPLETE)

            # Compute audit hash
            audit_data = {
                "audit_id": audit.id,
                "dataset_hash": audit.dataset.file_hash,
                "findings_count": len(audit.findings),
                "overall_severity": audit.overall_severity.value,
                "overall_score": audit.overall_score,
                "completed_at": datetime.utcnow().isoformat(),
            }
            audit.report_hash = hash_dict(audit_data)

            audit.status = AuditStatus.COMPLETE
            audit.completed_at = datetime.utcnow()

            self._update_agent(audit, "reporting", AgentStatus.COMPLETE)
            self._log(audit, "audit_complete", f"Audit complete: {audit.overall_severity}")
        except Exception as e:
            self._update_agent(audit, "reporting", AgentStatus.FAILED, str(e))
            audit.status = AuditStatus.FAILED
            self._log(audit, "audit_failed", str(e))

    def _update_agent(self, audit: Audit, agent_name: str, status: AgentStatus, error: str = None):
        """Update an agent's status."""
        agent = audit.agents.get(agent_name, AgentState())
        agent.status = status
        if status == AgentStatus.RUNNING:
            agent.started_at = datetime.utcnow()
        elif status in (AgentStatus.COMPLETE, AgentStatus.FAILED):
            agent.completed_at = datetime.utcnow()
        if error:
            agent.error = error
        audit.agents[agent_name] = agent

    def _log(self, audit: Audit, event: str, details: str):
        """Write to audit log."""
        audit.audit_log.append({
            "event": event,
            "details": details,
            "timestamp": datetime.utcnow().isoformat(),
        })


orchestrator_agent = OrchestratorAgent()
