"""
Equalyze — Legal Vector Store
Vertex AI Vector Search + Gemini Embeddings for legal regulation RAG.
Falls back to a comprehensive mock corpus when no GCP credentials are configured.
"""

import os
from typing import List, Dict, Any


# ── Mock Legal Corpus ────────────────────────────
# Domain-tagged legal clauses for realistic mock-mode results.

LEGAL_CORPUS = [
    # EU AI Act
    {
        "regulation_name": "EU AI Act",
        "jurisdiction": "EU",
        "article": "Article 10",
        "domains": ["healthcare", "lending", "insurance", "hiring", "other"],
        "content": "High-risk AI systems shall be developed with training, validation and testing datasets that meet quality criteria including representativeness, accuracy, completeness, and appropriate statistical properties for the intended purpose.",
    },
    {
        "regulation_name": "EU AI Act",
        "jurisdiction": "EU",
        "article": "Article 14",
        "domains": ["healthcare", "lending", "insurance", "hiring", "other"],
        "content": "High-risk AI systems shall be designed to allow effective human oversight, including the ability to fully understand, correctly interpret, and intervene or halt the system.",
    },
    {
        "regulation_name": "EU AI Act",
        "jurisdiction": "EU",
        "article": "Article 15",
        "domains": ["healthcare", "lending", "insurance", "hiring", "other"],
        "content": "High-risk AI systems shall be designed and developed in such a way that they achieve an appropriate level of accuracy, robustness and cybersecurity.",
    },
    # GDPR
    {
        "regulation_name": "GDPR",
        "jurisdiction": "EU",
        "article": "Article 22",
        "domains": ["healthcare", "lending", "insurance", "hiring", "other"],
        "content": "Individuals have the right not to be subject to a decision based solely on automated processing, including profiling, which produces legal effects or similarly significant effects.",
    },
    {
        "regulation_name": "GDPR",
        "jurisdiction": "EU",
        "article": "Article 35",
        "domains": ["healthcare", "lending", "insurance", "hiring", "other"],
        "content": "Where processing is likely to result in a high risk to rights and freedoms, the controller shall carry out a Data Protection Impact Assessment (DPIA) prior to processing.",
    },
    # US: ECOA
    {
        "regulation_name": "Equal Credit Opportunity Act (ECOA)",
        "jurisdiction": "US",
        "article": "15 U.S.C. § 1691",
        "domains": ["lending", "insurance"],
        "content": "It is unlawful for any creditor to discriminate against any applicant on the basis of race, color, religion, national origin, sex, marital status, or age. The four-fifths (80%) rule applies: selection rate for protected group < 80% of majority group rate = prima facie evidence of disparate impact.",
    },
    # US: Title VII
    {
        "regulation_name": "Title VII Civil Rights Act",
        "jurisdiction": "US",
        "article": "42 U.S.C. § 2000e",
        "domains": ["hiring"],
        "content": "Employers may not discriminate in hiring, promotion, or termination on the basis of race, color, religion, sex, or national origin. Algorithmic hiring tools that produce disparate impact are subject to the same standards.",
    },
    # India IT Act
    {
        "regulation_name": "Information Technology Act, 2000",
        "jurisdiction": "India",
        "article": "Section 43A",
        "domains": ["healthcare", "lending", "insurance", "hiring", "other"],
        "content": "Where a body corporate handling sensitive personal data is negligent in implementing reasonable security practices, it shall be liable to pay damages to the affected person.",
    },
    {
        "regulation_name": "Digital Personal Data Protection Act, 2023",
        "jurisdiction": "India",
        "article": "Section 7",
        "domains": ["healthcare", "lending", "insurance", "hiring", "other"],
        "content": "Personal data shall be processed only for a lawful purpose for which the Data Principal has given consent, with obligations of accuracy and purpose limitation.",
    },
    # CCPA
    {
        "regulation_name": "California Consumer Privacy Act (CCPA)",
        "jurisdiction": "US - California",
        "article": "§ 1798.185",
        "domains": ["healthcare", "lending", "insurance", "hiring", "other"],
        "content": "Businesses using automated decision-making technology must provide meaningful information about the logic involved, the significance, and the envisaged consequences of such processing.",
    },
    # Healthcare-specific
    {
        "regulation_name": "HIPAA",
        "jurisdiction": "US",
        "article": "45 CFR Part 164",
        "domains": ["healthcare"],
        "content": "Protected Health Information (PHI) used in AI/ML systems is subject to minimum necessary standard. Algorithmic bias in clinical decision support constitutes a compliance risk under HIPAA's Administrative Simplification provisions.",
    },
    # Insurance-specific
    {
        "regulation_name": "Unfair Trade Practices Act (NAIC Model)",
        "jurisdiction": "US",
        "article": "Model Law 880",
        "domains": ["insurance"],
        "content": "Unfair discrimination in insurance exists when using characteristics that are not actuarially justified and produce disparate impact on protected classes in rates, underwriting, or claims.",
    },
]


class LegalVectorStore:
    def __init__(self):
        self.project_id = os.environ.get("GOOGLE_CLOUD_PROJECT", "equalyze-dev")
        self.location = os.environ.get("GOOGLE_CLOUD_LOCATION", "us-central1")
        self.index_endpoint_id = os.environ.get("VERTEX_INDEX_ENDPOINT_ID")
        self.deployed_index_id = os.environ.get("VERTEX_DEPLOYED_INDEX_ID")

        self.index_endpoint = None
        self.embedding_model = None
        self.is_initialized = False

    def initialize(self):
        """Initialize Vertex AI Vector Search Endpoint + Gemini Embeddings."""
        if self.is_initialized:
            return

        print("Initializing Legal Vector Store...")

        # Try Vertex AI Vector Search
        if self.index_endpoint_id and self.deployed_index_id:
            try:
                from google.cloud import aiplatform
                aiplatform.init(project=self.project_id, location=self.location)
                self.index_endpoint = aiplatform.MatchingEngineIndexEndpoint(self.index_endpoint_id)
                print("Connected to Vertex AI Vector Search.")
            except Exception as e:
                print(f"Vertex AI Vector Search init failed: {e}. Using mock mode.")

        # Try Gemini Embeddings
        api_key = os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY")
        if api_key:
            try:
                import google.generativeai as genai
                genai.configure(api_key=api_key)
                self.embedding_model = genai
                print("Gemini Embeddings API configured.")
            except Exception as e:
                print(f"Gemini Embeddings init failed: {e}. Embeddings in mock mode.")
        else:
            print("No GEMINI_API_KEY. Embeddings in mock mode.")

        self.is_initialized = True

    def _get_query_embedding(self, text: str) -> list:
        """Get text embedding via Gemini text-embedding-005 or return mock."""
        if self.embedding_model:
            try:
                result = self.embedding_model.embed_content(
                    model="models/text-embedding-005",
                    content=text,
                    task_type="retrieval_query",
                )
                return result["embedding"]
            except Exception as e:
                print(f"Embedding API call failed: {e}")
        return [0.0] * 768

    def search(self, query: str, domain: str = "other", top_k: int = 3) -> List[Dict[str, Any]]:
        """
        Search for relevant legal clauses.
        - With Vertex AI: real vector similarity search
        - Without: domain-filtered mock corpus with keyword matching
        """
        if not self.is_initialized:
            self.initialize()

        # ── Production: Vertex AI Vector Search ───
        if self.index_endpoint:
            query_emb = self._get_query_embedding(query)
            try:
                response = self.index_endpoint.find_neighbors(
                    deployed_index_id=self.deployed_index_id,
                    queries=[query_emb],
                    num_neighbors=top_k,
                )
                results = []
                for neighbor in response[0]:
                    results.append({
                        "regulation_name": "Vertex Match",
                        "jurisdiction": "Global",
                        "content": f"Document ID: {neighbor.id} (Distance: {neighbor.distance})",
                    })
                return results
            except Exception as e:
                print(f"Vertex AI Search failed: {e}. Falling back to mock.")

        # ── Mock mode: domain-filtered corpus ─────
        domain_lower = domain.lower()

        # Filter by domain
        relevant = [
            entry for entry in LEGAL_CORPUS
            if domain_lower in entry.get("domains", []) or "other" in entry.get("domains", [])
        ]

        # Keyword boost: score each entry by query keyword overlap
        query_words = set(query.lower().split())
        scored = []
        for entry in relevant:
            content_words = set(entry["content"].lower().split())
            overlap = len(query_words & content_words)
            scored.append((overlap, entry))

        scored.sort(key=lambda x: x[0], reverse=True)

        return [
            {
                "regulation_name": entry["regulation_name"],
                "jurisdiction": entry["jurisdiction"],
                "article": entry.get("article", ""),
                "content": entry["content"],
            }
            for _, entry in scored[:top_k]
        ]


# Singleton
legal_vector_store = LegalVectorStore()

