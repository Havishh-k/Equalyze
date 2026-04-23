"""
Equalyze — Legal Vector Store
Vertex AI Vector Search-based Retrieval-Augmented Generation (RAG) index for legal statutes.
"""

import os
import glob
from typing import List, Dict, Any
from google.cloud import aiplatform

from api.config import settings

class LegalVectorStore:
    def __init__(self):
        self.project_id = os.environ.get("GOOGLE_CLOUD_PROJECT", "equalyze-dev")
        self.location = os.environ.get("GOOGLE_CLOUD_LOCATION", "us-central1")
        self.index_endpoint_id = os.environ.get("VERTEX_INDEX_ENDPOINT_ID")
        self.deployed_index_id = os.environ.get("VERTEX_DEPLOYED_INDEX_ID")
        
        self.index_endpoint = None
        self.is_initialized = False

    def initialize(self):
        """Initialize Vertex AI Vector Search Endpoint."""
        if self.is_initialized:
            return

        print("Initializing Legal Vector Store via Vertex AI...")
        if self.index_endpoint_id and self.deployed_index_id:
            aiplatform.init(project=self.project_id, location=self.location)
            self.index_endpoint = aiplatform.MatchingEngineIndexEndpoint(self.index_endpoint_id)
            print("Successfully connected to Vertex AI Vector Search.")
        else:
            print("Vertex AI configuration missing. Running in mock mode.")
            
        self.is_initialized = True

    def _get_query_embedding(self, text: str) -> list:
        # Real implementation would call Vertex AI Text Embeddings API.
        # Returning mock embedding for dev
        return [0.0] * 768

    def search(self, query: str, domain: str = "other", top_k: int = 3) -> List[Dict[str, Any]]:
        """Search the index for relevant legal clauses, optionally filtering/boosting by domain."""
        if not self.is_initialized:
            self.initialize()
            
        if not self.index_endpoint:
            # Mock mode fallback when no Vertex config is provided
            return [
                {
                    "regulation_name": "EU AI Act",
                    "jurisdiction": "EU",
                    "content": "Article 10: High-risk AI systems must use datasets subject to appropriate data governance and management practices."
                },
                {
                    "regulation_name": "GDPR",
                    "jurisdiction": "Global",
                    "content": "Article 22: Individuals have the right not to be subject to a decision based solely on automated processing, including profiling."
                }
            ]

        query_emb = self._get_query_embedding(query)
        
        try:
            response = self.index_endpoint.find_neighbors(
                deployed_index_id=self.deployed_index_id,
                queries=[query_emb],
                num_neighbors=top_k
            )
            
            results = []
            for neighbor in response[0]:
                results.append({
                    "regulation_name": "Vertex Match",
                    "jurisdiction": "Global",
                    "content": f"Document ID: {neighbor.id} (Distance: {neighbor.distance})"
                })
                
            return results
        except Exception as e:
            print(f"Vertex AI Search failed: {e}")
            return []


# Singleton instance
legal_vector_store = LegalVectorStore()
