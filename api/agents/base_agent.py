"""
Equalyze — Base Agent (Gemini API Wrapper)
All specialist agents inherit from this class.
"""

import json
import re
from typing import Any, Optional
import google.generativeai as genai

from api.config import settings


class BaseEqualyzeAgent:
    """
    Base class for all Equalyze agents.
    Wraps the google-generativeai SDK with:
    - Configurable model selection (Pro vs Flash)
    - JSON-forced output for auditability
    - Retry logic with backoff
    - Structured response parsing
    """

    def __init__(
        self,
        model_name: str = None,
        system_instruction: str = "",
        temperature: float = 0.1,
        max_output_tokens: int = 8192,
    ):
        # Configure API
        genai.configure(api_key=settings.GEMINI_API_KEY)

        self.model_name = model_name or settings.GEMINI_FLASH_MODEL
        self.system_instruction = system_instruction
        self.temperature = temperature
        self.max_output_tokens = max_output_tokens

        # Create model instance
        self.model = genai.GenerativeModel(
            model_name=self.model_name,
            system_instruction=self.system_instruction,
            generation_config=genai.GenerationConfig(
                temperature=self.temperature,
                top_p=0.95,
                max_output_tokens=self.max_output_tokens,
                response_mime_type="application/json",
            ),
        )

    async def invoke(self, prompt: str, context: Optional[dict] = None) -> dict[str, Any]:
        """
        Send a prompt to Gemini and get a structured JSON response.
        Includes retry logic for parse failures.
        """
        full_prompt = self._build_prompt(prompt, context)

        for attempt in range(3):
            try:
                response = await self.model.generate_content_async(full_prompt)
                return self._parse_response(response)
            except json.JSONDecodeError:
                if attempt == 2:
                    raise
                continue
            except Exception as e:
                if attempt == 2:
                    raise
                continue

    def invoke_sync(self, prompt: str, context: Optional[dict] = None) -> dict[str, Any]:
        """Synchronous version of invoke."""
        full_prompt = self._build_prompt(prompt, context)

        for attempt in range(3):
            try:
                response = self.model.generate_content(full_prompt)
                return self._parse_response(response)
            except json.JSONDecodeError:
                if attempt == 2:
                    raise
                continue
            except Exception as e:
                if attempt == 2:
                    raise
                continue

    def _build_prompt(self, prompt: str, context: Optional[dict] = None) -> str:
        """Build the full prompt, optionally including context."""
        if context:
            context_str = json.dumps(context, indent=2, default=str)
            return f"Context:\n{context_str}\n\nTask:\n{prompt}"
        return prompt

    def _parse_response(self, response) -> dict[str, Any]:
        """
        Parse Gemini response into a Python dict.
        Handles JSON extraction from mixed responses.
        """
        text = response.text.strip()

        # Try direct JSON parse
        try:
            return json.loads(text)
        except json.JSONDecodeError:
            pass

        # Try to extract JSON from markdown code blocks
        json_block = re.search(r"```(?:json)?\s*\n?(.*?)\n?```", text, re.DOTALL)
        if json_block:
            try:
                return json.loads(json_block.group(1).strip())
            except json.JSONDecodeError:
                pass

        # Try to find any JSON object in the text
        json_obj = re.search(r"\{.*\}", text, re.DOTALL)
        if json_obj:
            try:
                return json.loads(json_obj.group())
            except json.JSONDecodeError:
                pass

        # Try to find JSON array
        json_arr = re.search(r"\[.*\]", text, re.DOTALL)
        if json_arr:
            try:
                return {"items": json.loads(json_arr.group())}
            except json.JSONDecodeError:
                pass

        raise ValueError(f"Could not parse JSON from response: {text[:500]}")
