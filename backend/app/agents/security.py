"""Security Agent — detects security vulnerabilities."""

from typing import Any

from app.agents.base import BaseAgent
from app.config import get_settings
from app.schemas.issue import Issue


SECURITY_SYSTEM_PROMPT = """You are a security analysis agent. Scan the provided source code for security vulnerabilities:
- SQL injection
- Command injection
- Cross-site scripting (XSS)
- Hardcoded secrets (API keys, passwords, tokens)
- Unsafe input handling
- Insecure authentication logic
- Dependency vulnerabilities

Return a JSON object with this exact structure:
{
  "issues": [
    {
      "id": "sec_1",
      "type": "SQL_INJECTION",
      "severity": "CRITICAL",
      "file": "filename.py",
      "line": 12,
      "description": "Description of the vulnerability",
      "recommendation": "How to remediate"
    }
  ]
}

Valid types: SQL_INJECTION, COMMAND_INJECTION, XSS, HARDCODED_SECRET, UNSAFE_INPUT, INSECURE_AUTH, SECURITY
Valid severities: CRITICAL, HIGH, MEDIUM, LOW, INFO

Do NOT generate exploitation code. Only identify vulnerabilities.
Return ONLY valid JSON."""


class SecurityAgent(BaseAgent):
    """Scans source code for security vulnerabilities."""

    def __init__(self):
        settings = get_settings()
        super().__init__(model_id=settings.security_model_id)

    def run(self, source_files: dict[str, str], language: str = "python", **kwargs: Any) -> dict[str, Any]:
        """Scan source code for security vulnerabilities.

        Args:
            source_files: Dict of filename -> content
            language: Programming language

        Returns:
            dict with "issues" list
        """
        self._log(f"Security scanning {len(source_files)} files ({language})")

        if self.model_client.mock_mode:
            return self._mock_result()

        files_text = "\n".join(
            f"--- {name} ---\n{content}" for name, content in source_files.items()
        )

        prompt = f"""Perform a security analysis of the following {language} project.
Identify all security vulnerabilities.

{files_text}

Return your findings as structured JSON."""

        result = self.model_client.invoke_json(prompt, system_prompt=SECURITY_SYSTEM_PROMPT)

        issues = []
        for raw_issue in result.get("issues", []):
            try:
                issue = Issue(**raw_issue, agent="security")
                issues.append(issue.model_dump())
            except Exception as e:
                self._log(f"Skipping invalid issue: {e}")

        return {"issues": issues}

    def _mock_result(self) -> dict[str, Any]:
        """Return deterministic mock security results."""
        return {
            "issues": [
                {
                    "id": "sec_1",
                    "type": "SQL_INJECTION",
                    "severity": "CRITICAL",
                    "file": "app.py",
                    "line": 6,
                    "description": "User input is directly interpolated into SQL query string, allowing SQL injection attacks",
                    "recommendation": "Use parameterized queries: cursor.execute('SELECT * FROM users WHERE username = ?', (username,))",
                    "agent": "security",
                },
                {
                    "id": "sec_2",
                    "type": "SECURITY",
                    "severity": "HIGH",
                    "file": "app.py",
                    "line": 4,
                    "description": "Database connection not using context manager, potential resource leak on error",
                    "recommendation": "Wrap connection in 'with' statement or try/finally block",
                    "agent": "security",
                },
            ]
        }
