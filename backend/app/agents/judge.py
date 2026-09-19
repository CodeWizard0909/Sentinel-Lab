"""Judge Agent — deterministically verifies fixes and provides an LLM summary."""

from typing import Any
from app.agents.base import BaseAgent
from app.config import get_settings


JUDGE_SYSTEM_PROMPT = """You are the final judge of a code security verification system.
Write a 2-4 sentence plain-English summary of what was found, fixed, and tested based on the provided stats.
DO NOT output pass/fail booleans, ONLY output the summary.

{
  "summary": "<your summary here>"
}
"""

class JudgeAgent(BaseAgent):
    def __init__(self):
        settings = get_settings()
        super().__init__(model_id=settings.judge_model_id)

    def run(self, analyzer_result: dict, security_result: dict, sandbox_repaired: dict, **kwargs: Any) -> dict[str, Any]:
        self._log("Evaluating repair verification deterministically")

        analyzer_issues = len(analyzer_result.get("issues", []))
        security_issues = len(security_result.get("issues", []))
        total_issues = analyzer_issues + security_issues

        tests_passed = sandbox_repaired.get("testsPassed", sandbox_repaired.get("tests_passed", 0))
        tests_failed = sandbox_repaired.get("testsFailed", sandbox_repaired.get("tests_failed", 0))
        sandbox_status = sandbox_repaired.get("status", "FAIL")
        
        # DETERMINISTIC VERDICT (Not LLM)
        is_verified = (sandbox_status == "PASS" and tests_failed == 0)
        verdict = "VERIFIED" if is_verified else "FAILED"

        prompt = f"""
Verdict: {verdict}
Total issues found: {total_issues}
Tests passed: {tests_passed}
Tests failed: {tests_failed}
Sandbox status: {sandbox_status}
Write a 2-4 sentence plain-English summary.
"""
        summary = f"Sandbox verification {verdict.lower()}. {tests_passed} tests passed, {tests_failed} failed."
        
        if not self.model_client.mock_mode:
            try:
                result = self.model_client.invoke_json(prompt, system_prompt=JUDGE_SYSTEM_PROMPT, max_tokens=512)
                summary = result.get("summary", summary)
            except Exception as e:
                self._log(f"Judge LLM failed (falling back to deterministic summary): {e}")

        # The EXACT JSON structure the frontend React UI expects
        return {
            "is_verified": is_verified,
            "verdict": verdict,
            "confidence_score": 99.0 if is_verified else 0.0,
            "summary": summary,
            "reasoning": [
                f"Sandbox execution resulted in {sandbox_status}.",
                f"{tests_passed} tests passed, {tests_failed} tests failed."
            ],
            "regression_detected": tests_failed > 0,
            "security_mitigated": is_verified,
            "test_suite_passed": tests_failed == 0,
            "judge_model": self.model_client.model_id
        }
