"""Judge Agent — determines whether repairs are truly verified."""

from typing import Any

from app.agents.base import BaseAgent
from app.config import get_settings
from app.schemas.result import FinalResult, JudgeVerdict


JUDGE_SYSTEM_PROMPT = """You are a verification judge agent. Your role is to determine whether code repairs are TRULY verified.

You receive:
1. Original analysis (issues found)
2. Security analysis
3. Proposed repair
4. Sandbox execution results

Rules:
- NEVER mark a fix as VERIFIED merely because code was generated
- REQUIRE sandbox evidence (tests must have actually passed)
- If sandbox tests failed, verdict must be FAILED
- If sandbox did not run or results are inconclusive, verdict must be INCONCLUSIVE
- Distinguish between VERIFIED, FAILED, and INCONCLUSIVE
- Summarize evidence clearly

Return a JSON object with this exact structure:
{
  "status": "VERIFIED",
  "reason": "Clear explanation of why this verdict was reached",
  "issuesFound": 4,
  "issuesFixed": 4,
  "testsPassed": 14,
  "testsFailed": 0,
  "securityPassed": true
}

Valid status values: VERIFIED, FAILED, INCONCLUSIVE
Return ONLY valid JSON."""


class JudgeAgent(BaseAgent):
    """Determines whether code repairs are verified by sandbox evidence."""

    def __init__(self):
        settings = get_settings()
        super().__init__(model_id=settings.judge_model_id)

    def run(
        self,
        analyzer_result: dict[str, Any],
        security_result: dict[str, Any],
        repair_result: dict[str, Any],
        sandbox_original: dict[str, Any],
        sandbox_repaired: dict[str, Any],
        **kwargs: Any,
    ) -> dict[str, Any]:
        """Judge whether the repair is verified.

        Args:
            analyzer_result: Output from AnalyzerAgent
            security_result: Output from SecurityAgent
            repair_result: Output from RepairAgent
            sandbox_original: Sandbox result for original code
            sandbox_repaired: Sandbox result for repaired code

        Returns:
            dict matching FinalResult schema
        """
        self._log("Evaluating repair verification")

        if self.model_client.mock_mode:
            return self._mock_result(analyzer_result, security_result, sandbox_repaired)

        import json
        prompt = f"""Evaluate whether the following code repair is verified.

ORIGINAL ANALYSIS:
{json.dumps(analyzer_result, indent=2)}

SECURITY ANALYSIS:
{json.dumps(security_result, indent=2)}

PROPOSED REPAIR:
{json.dumps(repair_result, indent=2)}

SANDBOX RESULT (ORIGINAL CODE):
{json.dumps(sandbox_original, indent=2)}

SANDBOX RESULT (REPAIRED CODE):
{json.dumps(sandbox_repaired, indent=2)}

Based on the sandbox evidence, determine if the repair is VERIFIED, FAILED, or INCONCLUSIVE."""

        result = self.model_client.invoke_json(prompt, system_prompt=JUDGE_SYSTEM_PROMPT)

        # Validate with Pydantic
        try:
            final = FinalResult(**result)
            return final.model_dump(by_alias=True)
        except Exception as e:
            self._log(f"Judge output validation failed: {e}")
            return result

    def _mock_result(
        self,
        analyzer_result: dict[str, Any],
        security_result: dict[str, Any],
        sandbox_repaired: dict[str, Any],
    ) -> dict[str, Any]:
        """Return deterministic mock judge verdict."""
        analyzer_issues = len(analyzer_result.get("issues", []))
        security_issues = len(security_result.get("issues", []))
        total_issues = analyzer_issues + security_issues

        tests_passed = sandbox_repaired.get("testsPassed", 0)
        tests_failed = sandbox_repaired.get("testsFailed", 0)
        security_passed = sandbox_repaired.get("securityPassed", True)
        sandbox_status = sandbox_repaired.get("status", "PASS")

        # Apply judge rules
        if sandbox_status == "PASS" and tests_failed == 0 and security_passed:
            verdict = JudgeVerdict.VERIFIED
            reason = (
                f"All {total_issues} issues were addressed. "
                f"Sandbox executed successfully: {tests_passed} tests passed, 0 failed. "
                f"Security tests passed. The repair is verified with sandbox evidence."
            )
        elif sandbox_status == "ERROR" or sandbox_status == "TIMEOUT":
            verdict = JudgeVerdict.INCONCLUSIVE
            reason = f"Sandbox execution was {sandbox_status}. Cannot verify repair without successful test execution."
        else:
            verdict = JudgeVerdict.FAILED
            reason = f"Sandbox tests indicate issues remain: {tests_failed} tests failed."

        return {
            "status": verdict.value,
            "reason": reason,
            "issuesFound": total_issues,
            "issuesFixed": total_issues if verdict == JudgeVerdict.VERIFIED else total_issues - tests_failed,
            "testsPassed": tests_passed,
            "testsFailed": tests_failed,
            "securityPassed": security_passed,
        }
