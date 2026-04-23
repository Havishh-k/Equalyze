import json
from api.agents.base_agent import BaseEqualyzeAgent
from api.config import settings
from api.models.audit import ProxyWarning

PROXY_SYSTEM_PROMPT = """You are the Equalyze Proxy Detection Agent. 
Your job is to provide semantic, plain-English explanations for statistical proxy relationships.
Data scientists have mathematically determined that a feature strongly correlates with a protected attribute.
Explain WHY this correlation likely exists in the real world (e.g., historical context, systemic bias, socio-economic factors).

Always respond with valid JSON only. No prose, no explanations outside the JSON structure."""

EXPLANATION_PROMPT = """
We found a strong statistical proxy relationship:
Feature: '{feature}'
Correlates with Protected Attribute: '{protected}'
Correlation Score (Pearson/Cramér's V): {score}
Domain: {domain}

Please provide a plain-English, 1-2 sentence explanation of why this proxy exists in the real world.
Format the output as JSON:
{{
  "explanation": "Your explanation here."
}}
"""

class ProxyAgent(BaseEqualyzeAgent):
    """
    Agent that provides semantic explanations for mathematically identified proxy variables.
    """

    def __init__(self):
        super().__init__(
            model_name=settings.GEMINI_FLASH_MODEL,
            system_instruction=PROXY_SYSTEM_PROMPT,
            temperature=0.3,
        )

    def explain_proxies(self, proxies: list[ProxyWarning], domain: str = "other") -> list[ProxyWarning]:
        """
        Takes a list of proxy warnings and uses Gemini to add a semantic explanation.
        """
        for proxy in proxies:
            prompt = EXPLANATION_PROMPT.format(
                feature=proxy.column,
                protected=proxy.correlated_with,
                score=proxy.correlation_coefficient,
                domain=domain
            )
            
            try:
                result = self.invoke_sync(prompt)
                explanation = result.get("explanation", "")
                proxy.explanation = explanation
            except Exception as e:
                print(f"[ProxyAgent] Failed to explain proxy {proxy.column}: {e}")
                proxy.explanation = "Explanation unavailable due to AI timeout."
                
        return proxies

proxy_agent = ProxyAgent()
