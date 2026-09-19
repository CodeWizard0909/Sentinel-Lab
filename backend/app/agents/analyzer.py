"""Analyzer Agent — detects code quality issues and bugs."""

from typing import Any

from app.agents.base import BaseAgent
from app.config import get_settings
from app.schemas.issue import Issue


ANALYZER_SYSTEM_PROMPT = """You are a code analysis agent. Analyze the provided source code for:
- Logic bugs
- Code quality issues
- Performance problems
- Error handling gaps

Return a JSON object with this exact structure:
{
  "issues": [
    {
      "id": "issue_1",
      "type": "LOGIC_BUG",
      "severity": "MEDIUM",
      "file": "filename.py",
      "line": 12,
      "description": "Description of the issue",
      "recommendation": "How to fix it"
    }
  ]
}

Valid types: LOGIC_BUG, CODE_QUALITY, PERFORMANCE
Valid severities: CRITICAL, HIGH, MEDIUM, LOW, INFO

Return ONLY valid JSON. No markdown, no explanation outside JSON."""


class AnalyzerAgent(BaseAgent):
    """Analyzes source code for bugs and quality issues."""

    def __init__(self):
        settings = get_settings()
        super().__init__(model_id=settings.analyzer_model_id)

    def run(self, source_files: dict[str, str], language: str = "python", **kwargs: Any) -> dict[str, Any]:
        """Analyze source code and return issues.

        Args:
            source_files: Dict of filename -> content
            language: Programming language

        Returns:
            dict with "issues" list
        """
        self._log(f"Analyzing {len(source_files)} files ({language})")

        if self.model_client.mock_mode:
            return self._mock_result(source_files)

        # Build prompt with source code
        files_text = "\n".join(
            f"--- {name} ---\n{content}" for name, content in source_files.items()
        )

        prompt = f"""Analyze the following {language} project for bugs and code quality issues.

{files_text}

Return your analysis as structured JSON."""

        result = self.model_client.invoke_json(prompt, system_prompt=ANALYZER_SYSTEM_PROMPT)

        # Validate issues
        issues = []
        for raw_issue in result.get("issues", []):
            try:
                issue = Issue(**raw_issue, agent="analyzer")
                issues.append(issue.model_dump())
            except Exception as e:
                self._log(f"Skipping invalid issue: {e}")

        return {"issues": issues}

    def _mock_result(self, source_files: dict[str, str]) -> dict[str, Any]:
        """Return deterministic mock analysis results."""
        return {
            "issues": [
                {
                    "id": "issue_1",
                    "type": "SQL_INJECTION",
                    "severity": "CRITICAL",
                    "file": "app.py",
                    "line": 6,
                    "description": "SQL query constructed using string formatting with user input, vulnerable to SQL injection",
                    "recommendation": "Use parameterized queries with placeholders instead of string formatting",
                    "agent": "analyzer",
                },
                {
                    "id": "issue_2",
                    "type": "CODE_QUALITY",
                    "severity": "MEDIUM",
                    "file": "app.py",
                    "line": 4,
                    "description": "Database connection is not properly closed after use",
                    "recommendation": "Use a context manager (with statement) for the database connection",
                    "agent": "analyzer",
                },
            ]
        }
