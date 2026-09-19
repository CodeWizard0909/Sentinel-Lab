"""AgentCore Code Interpreter sandbox implementation.

Real implementation will use Amazon Bedrock AgentCore Code Interpreter.
In mock mode, returns deterministic test results.

Phase 4 will add the real AgentCore integration.
"""

import logging
import time

from app.sandbox.base import SandboxExecutor
from app.schemas.sandbox import SandboxRequest, SandboxResult, SandboxStatus
from app.config import get_settings

logger = logging.getLogger(__name__)


class AgentCoreSandbox(SandboxExecutor):
    """Amazon Bedrock AgentCore Code Interpreter sandbox.

    Executes code in a fully isolated environment managed by AWS.
    """

    def __init__(self):
        settings = get_settings()
        self.mock_mode = settings.mock_mode
        self.sandbox_id = settings.agentcore_sandbox_id

        if not self.mock_mode:
            # Real AgentCore client initialization will be added in Phase 4
            # after verifying current AWS SDK support
            import boto3
            self.client = boto3.client("bedrock-agent-runtime", region_name=settings.aws_region)

    def run(self, request: SandboxRequest) -> SandboxResult:
        """Execute code and tests in the AgentCore sandbox.

        Args:
            request: SandboxRequest with code, tests, and config

        Returns:
            SandboxResult with execution outcome
        """
        if self.mock_mode:
            return self._mock_run(request)

        return self._real_run(request)

    def _real_run(self, request: SandboxRequest) -> SandboxResult:
        """Execute using real AgentCore Code Interpreter.

        TODO: Implement in Phase 4 after verifying AgentCore API.
        """
        logger.warning("Real AgentCore execution not yet implemented — returning mock result")
        return self._mock_run(request)

    def _mock_run(self, request: SandboxRequest) -> SandboxResult:
        """Return deterministic mock sandbox results."""
        start = time.time()

        # Simulate execution delay
        num_tests = len(request.tests) + len(request.security_tests)
        total_tests = max(num_tests, 3)  # At least 3 mock tests

        # Simulate based on whether code has known vulnerabilities
        code_content = "\n".join(request.code.values())
        has_sqli = "f\"SELECT" in code_content or "f'SELECT" in code_content
        has_hardcoded = "password" in code_content.lower() and "=" in code_content

        if has_sqli or has_hardcoded:
            # Original (vulnerable) code — some tests should fail
            return SandboxResult(
                status=SandboxStatus.FAIL,
                stdout="Running tests...\n2 passed, 1 failed",
                stderr="FAILED test_sql_injection_prevented - AssertionError: Expected None but got ('alice', ...)",
                tests_passed=total_tests - 1,
                tests_failed=1,
                security_passed=False,
                execution_time_ms=int((time.time() - start) * 1000) + 1523,
            )
        else:
            # Fixed code — all tests pass
            return SandboxResult(
                status=SandboxStatus.PASS,
                stdout=f"Running tests...\n{total_tests} passed, 0 failed\nAll security checks passed.",
                stderr="",
                tests_passed=total_tests,
                tests_failed=0,
                security_passed=True,
                execution_time_ms=int((time.time() - start) * 1000) + 1847,
            )


def get_sandbox() -> SandboxExecutor:
    """Factory for sandbox executor."""
    return AgentCoreSandbox()
