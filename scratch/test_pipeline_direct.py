import pandas as pd
from datetime import datetime
from api.models.audit import Audit, AuditStatus
from api.routers.audits import run_audit_pipeline, _active_audits

import asyncio

async def test_pipeline():
    audit = Audit(
        id="test-manual-run",
        status=AuditStatus.RUNNING,
        dataset=None,
        model_metadata=None,
        schema_map={"protected_attributes": ["gender"]}
    )
    _active_audits[audit.id] = audit
    df = pd.DataFrame({"age": [25, 35], "gender": ["M", "F"], "outcome": [1, 0]})
    print("Running pipeline...")
    await run_audit_pipeline(audit.id, "demo-org", df, audit.schema_map)
    print("Done pipeline. Status:", audit.status)

if __name__ == "__main__":
    asyncio.run(test_pipeline())
