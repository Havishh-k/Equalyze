import asyncio
import pandas as pd
import sys
import os

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from api.services.fairness_metrics import FairnessEvaluator
from api.agents.twin_engine_agent import TwinEngineAgent

async def main():
    # Create dummy data where 'Female' + 'Young' is discriminated against
    data = []
    for _ in range(100):
        data.append({"gender": "Male", "age": "Old", "income": 50000, "approved": 1})
        data.append({"gender": "Male", "age": "Young", "income": 40000, "approved": 1})
        data.append({"gender": "Female", "age": "Old", "income": 45000, "approved": 1})
        data.append({"gender": "Female", "age": "Young", "income": 35000, "approved": 0})
        data.append({"gender": "Female", "age": "Young", "income": 40000, "approved": 0})

    df = pd.DataFrame(data)
    schema_map = {
        "protected_attributes": ["gender", "age"],
        "valid_factors": ["income"],
        "outcome": "approved"
    }

    print("Running evaluator...")
    evaluator = FairnessEvaluator(df, schema_map)
    results = evaluator.run_full_audit()

    print("\nEvaluator Results for 'gender':")
    for key, val in results.get("gender", {}).items():
        if key == "intersectional":
            print("  Intersectional:")
            for item in val:
                print(f"    {item['attributes']}: max_disp={item['max_disparity']}, worst={item['worst_group']}, best={item['best_group']}")
                print(f"    Values: worst={item.get('worst_group_values')} best={item.get('best_group_values')}")
    
    print("\nRunning TwinEngineAgent...")
    agent = TwinEngineAgent()
    findings = await agent.analyze(df, schema_map, domain="lending")

    print(f"\nFindings generated: {len(findings)}")
    for f in findings:
        print(f"Finding Type: {f.finding_type}, Attr: {f.protected_attribute}")
        if f.finding_type == "intersectional":
            if f.counterfactual_twins:
                twin = f.counterfactual_twins[0]
                print("  Twin generated successfully!")
                print(f"  Changed: {twin.changed_attributes}")
                print(f"  Original Outcome: {twin.original_outcome} -> Twin Outcome: {twin.twin_outcome}")
                print(f"  Statement: {twin.discrimination_statement}")
            else:
                print("  Failed to generate twin for intersectional.")

if __name__ == "__main__":
    asyncio.run(main())
