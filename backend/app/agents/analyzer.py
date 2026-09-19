"""Analyzer Agent — detects code quality issues and logic bugs."""

from typing import Any
from app.agents.base import BaseAgent
from app.config import get_settings


ANALYZER_SYSTEM_PROMPT = """You are a senior software engineer performing a code quality audit.

Your job is to analyze the provided code and identify:
- Logic bugs (off-by-one errors, null pointer dereferences, incorrect conditionals)
- Anti-patterns (deeply nested code, dead code, code that will silently fail)
- Bad practices (missing error handling, resource leaks)

You must respond ONLY with a valid JSON object in this EXACT format:
{
  "issues": [
    {
      "id": "issue_<num>",
      "type": "LOGIC_BUG",
      "severity": "MEDIUM",
      "file": "<filename>",
      "line": <integer>,
      "description": "<clear description of the bug>",
      "recommendation": "<fix recommendation>"
    }
  ]
}

Valid types: LOGIC_BUG, CODE_QUALITY, PERFORMANCE
Valid severities: CRITICAL, HIGH, MEDIUM, LOW, INFO
Do NOT report security vulnerabilities here — those are handled by a dedicated Security Agent.
"""


class AnalyzerAgent(BaseAgent):
    def __init__(self):
        settings = get_settings()
        super().__init__(model_id=settings.analyzer_model_id)

    def run(self, source_files: dict[str, str], language: str = "python", **kwargs: Any) -> dict[str, Any]:
        self._log(f"Analyzing {len(source_files)} files ({language})")

        if self.model_client.mock_mode:
            return {"issues": []}  # Use clean mock or specific test data as needed

        files_text = "\n".join(f"--- {name} ---\n```{language}\n{content}\n```" for name, content in source_files.items())

        prompt = f"Analyze the following {language} project for logic bugs and code quality issues:\n\n{files_text}"

        try:
            result = self.model_client.invoke_json(prompt, system_prompt=ANALYZER_SYSTEM_PROMPT)
            # Add agent tag
            for issue in result.get("issues", []):
                issue["agent"] = "analyzer"
            return result
        except Exception as e:
            self._log(f"Analyzer failed: {e}")
            return {"issues": []}
