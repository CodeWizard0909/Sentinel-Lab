"""Scan pipeline orchestrator — runs the full agent pipeline.

Steps:
1.  Load scan from DynamoDB
2.  Load project from S3
3.  Set status = ANALYZING
4.  Analyzer Agent
5.  Security Agent
6.  Set status = REPAIRING
7.  Repair Agent
8.  Set status = TESTING
9.  Run original code/tests in sandbox
10. Run repaired code/tests in sandbox
11. Set status = VERIFYING
12. Judge Agent
13. Save complete results
14. Set status = COMPLETED
15. On exception: save error, set status = FAILED
"""

import logging
from typing import Any

from app.aws.dynamodb import get_dynamodb_client
from app.aws.s3 import get_s3_client
from app.agents.analyzer import AnalyzerAgent
from app.agents.security import SecurityAgent
from app.agents.repair import RepairAgent
from app.agents.judge import JudgeAgent
from app.sandbox.agentcore import get_sandbox
from app.schemas.scan import ScanStatus
from app.schemas.sandbox import SandboxRequest

logger = logging.getLogger(__name__)


class ScanPipeline:
    """Orchestrates the full scan pipeline."""

    def __init__(self):
        self.db = get_dynamodb_client()
        self.s3 = get_s3_client()

    def run(self, scan_id: str) -> dict[str, Any]:
        """Run the complete scan pipeline.

        Args:
            scan_id: The scan to process

        Returns:
            Final scan state dict
        """
        logger.info(f"Pipeline starting for scan {scan_id}")

        try:
            # 1. Load scan from DynamoDB
            scan = self.db.get_scan(scan_id)
            if not scan:
                raise ValueError(f"Scan {scan_id} not found")

            # 2. Load project from S3
            source_files = self.s3.get_project_files(scan_id)
            if not source_files:
                raise ValueError(f"No project files found for scan {scan_id}")

            # 3. Set status = ANALYZING
            self.db.update_status(scan_id, ScanStatus.ANALYZING.value)

            # 4. Analyzer Agent
            logger.info(f"[{scan_id}] Running Analyzer Agent")
            analyzer = AnalyzerAgent()
            analyzer_result = analyzer.run(source_files=source_files)

            # 5. Security Agent
            logger.info(f"[{scan_id}] Running Security Agent")
            security = SecurityAgent()
            security_result = security.run(source_files=source_files)

            # Merge issues and update DB
            all_issues = analyzer_result.get("issues", []) + security_result.get("issues", [])
            self.db.update_scan(scan_id, {"issues": all_issues})

            # 6. Set status = REPAIRING
            self.db.update_status(scan_id, ScanStatus.REPAIRING.value)

            # 7. Repair Agent
            logger.info(f"[{scan_id}] Running Repair Agent")
            repair = RepairAgent()
            repair_result = repair.run(
                source_files=source_files,
                analyzer_issues=analyzer_result.get("issues", []),
                security_issues=security_result.get("issues", []),
            )
            self.db.update_scan(scan_id, {"repairs": repair_result})

            # 8. Set status = TESTING
            self.db.update_status(scan_id, ScanStatus.TESTING.value)

            # 9. Run original code/tests in sandbox
            logger.info(f"[{scan_id}] Running original code in sandbox")
            sandbox = get_sandbox()

            # Build test files from repair result
            test_files = {}
            for test in repair_result.get("tests", []):
                test_files[test["file"]] = test["content"]

            original_request = SandboxRequest(
                code=source_files,
                language="python",
                tests=test_files,
            )
            sandbox_original = sandbox.run(original_request)

            # 10. Run repaired code/tests in sandbox
            logger.info(f"[{scan_id}] Running repaired code in sandbox")
            repaired_files = dict(source_files)  # Copy original
            for fixed in repair_result.get("fixedFiles", []):
                repaired_files[fixed["file"]] = fixed["fixedContent"]

            repaired_request = SandboxRequest(
                code=repaired_files,
                language="python",
                tests=test_files,
            )
            sandbox_repaired = sandbox.run(repaired_request)

            sandbox_result = {
                "original": sandbox_original.model_dump(by_alias=True),
                "repaired": sandbox_repaired.model_dump(by_alias=True),
            }
            self.db.update_scan(scan_id, {"sandboxResult": sandbox_result})

            # 11. Set status = VERIFYING
            self.db.update_status(scan_id, ScanStatus.VERIFYING.value)

            # 12. Judge Agent
            logger.info(f"[{scan_id}] Running Judge Agent")
            judge = JudgeAgent()
            final_result = judge.run(
                analyzer_result=analyzer_result,
                security_result=security_result,
                repair_result=repair_result,
                sandbox_original=sandbox_original.model_dump(by_alias=True),
                sandbox_repaired=sandbox_repaired.model_dump(by_alias=True),
            )

            # 13. Save complete results
            self.db.update_scan(scan_id, {"finalResult": final_result})

            # 14. Set status = COMPLETED
            self.db.update_status(scan_id, ScanStatus.COMPLETED.value)

            logger.info(f"Pipeline completed for scan {scan_id}: {final_result.get('status')}")
            return final_result

        except Exception as e:
            # 15. On exception: save error, set status = FAILED
            logger.error(f"Pipeline failed for scan {scan_id}: {e}")
            self.db.update_scan(scan_id, {"error": str(e)})
            self.db.update_status(scan_id, ScanStatus.FAILED.value)
            raise
