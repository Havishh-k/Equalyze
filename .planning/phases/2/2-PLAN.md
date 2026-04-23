---
phase: 2
status: executed
title: Intersectional Deep-Dive
---

<objective>
Detect and prove composite discrimination (e.g., Rural + Female) with dedicated twins.
</objective>

<steps>
1. Enhance `FairnessEvaluator._intersectional_analysis` in `api/services/fairness_metrics.py`. It currently returns raw dicts. Ensure the output structure cleanly maps into `BiasMetric` objects where necessary.
2. Update `FindingType` enum in `api/models/audit.py` to include `INTERSECTIONAL`.
3. Update `TwinEngineAgent.analyze` in `api/agents/twin_engine_agent.py` to:
   - Identify intersectional disparities.
   - When intersectional disparity > threshold (e.g., severity RED or AMBER), generate a dedicated `Finding` with `FindingType.INTERSECTIONAL`.
   - Use a new `INTERSECTIONAL_TWIN_PROMPT` to isolate the specific overlapping attributes causing the disadvantage.
4. Ensure severity scoring is weighted to accommodate the new findings.
</steps>
