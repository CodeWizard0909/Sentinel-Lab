"""Security Agent — detects OWASP vulnerabilities."""

from typing import Any
from app.agents.base import BaseAgent
from app.config import get_settings


SECURITY_SYSTEM_PROMPT = """You are an expert application security engineer performing a security code review.

Detect OWASP vulnerabilities (SQL Injection, XSS, hardcoded secrets, insecure input, broken auth).

You must respond ONLY with a valid JSON object in this EXACT format:
{
  "issues": [
    {
      "id": "sec_<num>",
      "type": "SQL_INJECTION",
      "severity": "CRITICAL",
      "file": "<filename>",
      "line": <integer>,
      "description": "<technical description>",
      "recommendation": "<exploit vector / recommendation>"
    }
  ]
}

Valid severities: CRITICAL, HIGH, MEDIUM, LOW, INFO
If no vulnerabilities found, return: {"issues": []}
"""

class SecurityAgent(BaseAgent):
    def __init__(self):
        settings = get_settings()
        super().__init__(model_id=settings.security_model_id)

    def run(self, source_files: dict[str, str], language: str = "python", **kwargs: Any) -> dict[str, Any]:
        self._log(f"Security scan on {len(source_files)} files ({language})")

        if self.model_client.mock_mode:
            code_content = "\n".join(source_files.values())
            if "f'SELECT" in code_content or 'f"SELECT' in code_content:
                return {
                    "issues": [{
                        "id": "sec_mock_1",
                        "type": "SQL_INJECTION",
                        "severity": "CRITICAL",
                        "file": "main.py",
                        "line": 1,
                        "description": "Mock SQL Injection",
                        "recommendation": "Use parameterized queries",
                        "agent": "security"
                    }]
                }
            return {"issues": []}

        files_text = "\n".join(f"--- {name} ---\n```{language}\n{content}\n```" for name, content in source_files.items())
        prompt = f"Perform a security audit of the following {language} code:\n\n{files_text}"

        try:
            result = self.model_client.invoke_json(prompt, system_prompt=SECURITY_SYSTEM_PROMPT)
            for issue in result.get("issues", []):
                issue["agent"] = "security"
            return result
        except Exception as e:
            self._log(f"Security agent failed: {e}")
            return {"issues": []}
