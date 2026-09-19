"""Repair Agent — generates patches."""

import json
from typing import Any
from app.agents.base import BaseAgent
from app.config import get_settings


REPAIR_SYSTEM_PROMPT = """You are a senior security-focused software engineer performing code remediation.

1. Receive code with a specific identified issue.
2. Generate a minimal, targeted fix that resolves the issue WITHOUT changing unrelated code.
3. Provide a clear explanation of what was wrong and why your fix resolves it.
4. Provide a unified diff.

You must respond ONLY with a valid JSON object in this EXACT format:
{
  "repairs": [
    {
      "id": "rep_1",
      "issue_id": "<the id of the issue you are fixing>",
      "file_path": "<filename>",
      "original_code": "<the snippet before>",
      "repaired_code": "<the snippet after>",
      "diff": "<unified diff>",
      "explanation": "<explanation of fix>"
    }
  ],
  "fixedFiles": [
    {
      "file": "<filename>",
      "fixedContent": "<the COMPLETE updated file content>"
    }
  ]
}

If sandbox execution failed previously (stderr provided), address that specific error.
"""

class RepairAgent(BaseAgent):
    def __init__(self):
        settings = get_settings()
        super().__init__(model_id=settings.repair_model_id)

    def run(self, source_files: dict[str, str], issue: dict[str, Any], sandbox_stderr: str = "", language: str = "python", **kwargs: Any) -> dict[str, Any]:
        self._log(f"Generating repair for issue {issue.get('id')}")

        if self.model_client.mock_mode:
            fixed = {}
            for name, content in source_files.items():
                fixed_content = content.replace('f"SELECT', '"SELECT').replace("f'SELECT", "'SELECT")
                fixed[name] = fixed_content
            return {
                "repairs": [
                    {
                        "id": "rep_1",
                        "issue_id": issue.get("id", "sec_1"),
                        "file_path": list(source_files.keys())[0] if source_files else "main.py",
                        "original_code": list(source_files.values())[0] if source_files else "",
                        "repaired_code": list(fixed.values())[0] if fixed else "",
                        "diff": "- query = f\"SELECT * FROM ...\"\n+ query = \"SELECT * FROM ...\"",
                        "explanation": "Replaced insecure formatted query with parameterized query."
                    }
                ],
                "fixedFiles": [
                    {
                        "file": name,
                        "fixedContent": content
                    }
                    for name, content in fixed.items()
                ]
            }

        files_text = "\n".join(f"--- {name} ---\n```{language}\n{content}\n```" for name, content in source_files.items())
        issue_text = json.dumps(issue, indent=2)
        
        retry_section = ""
        if sandbox_stderr:
            retry_section = f"\n\n⚠️ PREVIOUS ATTEMPT FAILED in sandbox:\n```\n{sandbox_stderr}\n```\nYour new fix MUST address both the original issue AND this error.\n"

        prompt = f"Fix the following issue in the codebase.\n\n## ISSUE:\n{issue_text}\n{retry_section}\n\n## CODEBASE:\n{files_text}"

        try:
            return self.model_client.invoke_json(prompt, system_prompt=REPAIR_SYSTEM_PROMPT, max_tokens=4096)
        except Exception as e:
            self._log(f"Repair agent failed: {e}")
            return {"repairs": [], "fixedFiles": []}
