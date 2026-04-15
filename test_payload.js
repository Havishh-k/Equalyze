const fetch = require("node-fetch");

async function run() {
  const payload = {
    dataset_id: "test",
    schema_map: {
      protected_attributes: ["Income Group"],
      valid_factors: [],
      outcome: "Winning Probability (%)",
      proxy_warnings: [
        {
          column: "Income Group",
          correlated_with: "Location",
          correlation_coefficient: 0.85,
          severity: "HIGH"
        }
      ],
      column_tags: [
        {
          column_name: "Income Group",
          tag: "PROTECTED_ATTRIBUTE",
          confidence: 0.9,
          rationale: "Protected attribute",
          proxy_warning: false
        }
      ]
    },
    model_metadata: {
      organization_name: "Acme Healthcare",
      model_name: "Test",
      domain: "healthcare",
      model_type: "classification",
      jurisdiction: ["india", "eu", "usa"]
    }
  };

  try {
    console.log("Sending:", JSON.stringify(payload));
    const res = await fetch("http://localhost:8000/api/v1/audits", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const text = await res.text();
    console.log("Status:", res.status);
    console.log("Response:", text);
  } catch (e) {
    console.error(e);
  }
}

run();
