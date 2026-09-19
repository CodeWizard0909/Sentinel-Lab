"""Repair Agent — generates code fixes for detected issues."""

from typing import Any

from app.agents.base import BaseAgent
from app.config import get_settings
from app.schemas.repair import RepairResult


REPAIR_SYSTEM_PROMPT = """You are a code repair agent. Given source code and a list of issues, generate fixed code.

Return a JSON object with this exact structure:
{
  "fixedFiles": [
    {
      "file": "filename.py",
      "originalContent": "original source code",
      "fixedContent": "fixed source code",
      "diff": "unified diff"
    }
  ],
  "diff": "complete unified diff",
  "explanation": "Clear explanation of all changes made",
  "tests": [
    {
      "file": "test_fixes.py",
      "content": "test code that verifies the fix",
      "description": "what this test checks"
    }
  ]
}

Rules:
- Fix ALL identified issues
- Do NOT claim the fix is verified — only sandbox + judge can verify
- Generate tests that specifically validate each fix
- Keep changes minimal and targeted
- Return ONLY valid JSON"""


class RepairAgent(BaseAgent):
    """Generates code fixes for detected issues."""

    def __init__(self):
        settings = get_settings()
        super().__init__(model_id=settings.repair_model_id)

    def run(
        self,
        source_files: dict[str, str],
        analyzer_issues: list[dict],
        security_issues: list[dict],
        language: str = "python",
        **kwargs: Any,
    ) -> dict[str, Any]:
        """Generate fixes for identified issues.

        Args:
            source_files: Dict of filename -> content
            analyzer_issues: Issues from the analyzer agent
            security_issues: Issues from the security agent
            language: Programming language

        Returns:
            dict matching RepairResult schema
        """
        all_issues = analyzer_issues + security_issues
        self._log(f"Repairing {len(all_issues)} issues in {len(source_files)} files")

        if self.model_client.mock_mode:
            return self._mock_result(source_files)

        files_text = "\n".join(
            f"--- {name} ---\n{content}" for name, content in source_files.items()
        )

        import json
        issues_text = json.dumps(all_issues, indent=2)

        prompt = f"""Fix the following issues in the {language} project.

SOURCE CODE:
{files_text}

ISSUES TO FIX:
{issues_text}

Generate the fixed code and tests to verify the fixes."""

        result = self.model_client.invoke_json(prompt, system_prompt=REPAIR_SYSTEM_PROMPT)

        # Validate with Pydantic
        try:
            repair = RepairResult(**result)
            return repair.model_dump(by_alias=True)
        except Exception as e:
            self._log(f"Repair output validation failed: {e}")
            return result

    def _mock_result(self, source_files: dict[str, str]) -> dict[str, Any]:
        """Return deterministic mock repair results."""
        return {
            "fixedFiles": [
                {
                    "file": "app.py",
                    "originalContent": source_files.get("app.py", ""),
                    "fixedContent": (
                        'import sqlite3\n'
                        '\n'
                        '\n'
                        'def get_user(username):\n'
                        '    """Safely query user by username using parameterized query."""\n'
                        '    with sqlite3.connect("users.db") as conn:\n'
                        '        cursor = conn.cursor()\n'
                        '        cursor.execute(\n'
                        '            "SELECT * FROM users WHERE username = ?",\n'
                        '            (username,)\n'
                        '        )\n'
                        '        return cursor.fetchone()\n'
                    ),
                    "diff": (
                        '--- a/app.py\n'
                        '+++ b/app.py\n'
                        '@@ -3,6 +3,8 @@\n'
                        ' def get_user(username):\n'
                        '-    conn = sqlite3.connect("users.db")\n'
                        '-    cursor = conn.cursor()\n'
                        '-    query = f"SELECT * FROM users WHERE username = \'{username}\'"\n'
                        '-    cursor.execute(query)\n'
                        '-    return cursor.fetchone()\n'
                        '+    """Safely query user by username using parameterized query."""\n'
                        '+    with sqlite3.connect("users.db") as conn:\n'
                        '+        cursor = conn.cursor()\n'
                        '+        cursor.execute(\n'
                        '+            "SELECT * FROM users WHERE username = ?",\n'
                        '+            (username,)\n'
                        '+        )\n'
                        '+        return cursor.fetchone()\n'
                    ),
                }
            ],
            "diff": "See individual file diffs above",
            "explanation": (
                "1. Fixed SQL injection by replacing f-string query with parameterized query using ? placeholder.\n"
                "2. Added context manager (with statement) for proper database connection handling.\n"
                "3. Added docstring for clarity."
            ),
            "tests": [
                {
                    "file": "test_security.py",
                    "content": (
                        'import sqlite3\n'
                        'import pytest\n'
                        'from app import get_user\n'
                        '\n'
                        '\n'
                        'def setup_db():\n'
                        '    conn = sqlite3.connect("users.db")\n'
                        '    conn.execute("CREATE TABLE IF NOT EXISTS users (id INTEGER, username TEXT, email TEXT)")\n'
                        '    conn.execute("INSERT OR IGNORE INTO users VALUES (1, \'alice\', \'alice@test.com\')")\n'
                        '    conn.execute("INSERT OR IGNORE INTO users VALUES (2, \'bob\', \'bob@test.com\')")\n'
                        '    conn.commit()\n'
                        '    conn.close()\n'
                        '\n'
                        '\n'
                        'def test_normal_query():\n'
                        '    setup_db()\n'
                        '    result = get_user("alice")\n'
                        '    assert result is not None\n'
                        '    assert result[1] == "alice"\n'
                        '\n'
                        '\n'
                        'def test_sql_injection_prevented():\n'
                        '    setup_db()\n'
                        '    result = get_user("\\\' OR 1=1 --")\n'
                        '    assert result is None  # Should NOT return any rows\n'
                        '\n'
                        '\n'
                        'def test_empty_username():\n'
                        '    setup_db()\n'
                        '    result = get_user("")\n'
                        '    assert result is None\n'
                    ),
                    "description": "Tests that SQL injection is prevented and normal queries work",
                }
            ],
        }
