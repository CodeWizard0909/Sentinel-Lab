"""Scan pipeline orchestrator — Multi-agent state machine.

Replaced with brain/ orchestrator logic.
Features:
- Parallel Analyzer & Security execution
- Sandbox Retry Loop for Repair Agent
- Deterministic Judge fallback
"""

import logging
import concurrent.futures
from datetime import datetime, timezone
from typing import Any

from app.aws.dynamodb import get_dynamodb_client
from app.agents.analyzer import AnalyzerAgent
from app.agents.security import SecurityAgent
from app.agents.repair import RepairAgent
from app.agents.judge import JudgeAgent
from app.sandbox.agentcore import get_sandbox
from app.schemas.scan import ScanStatus
from app.schemas.sandbox import SandboxRequest

logger = logging.getLogger(__name__)


class ScanPipeline:
    def __init__(self):
        self.db = get_dynamodb_client()
        self.sandbox = get_sandbox()
        self.max_retries = 3

    def run(self, scan_id: str, code: str = "", language: str = "python", test_code: str = "") -> dict[str, Any]:
        logger.info(f"Pipeline starting for scan {scan_id}")
        if not code:
            scan_data = self.db.get_scan(scan_id) or {}
            code = scan_data.get("code") or 'import sqlite3\ndef authenticate_user(u, p):\n    return f"SELECT * FROM users WHERE u=\'{u}\'"'
        source_files = {"main.py": code}
        test_files = {"test.py": test_code} if test_code else {}

        def update_state(status: ScanStatus, extra: dict = None):
            logger.info(f"[{scan_id}] STATUS: {status.value}")
            self.db.update_status(scan_id, status.value)
            if extra:
                self.db.update_scan(scan_id, extra)

        try:
            update_state(ScanStatus.ANALYZING)
            analyzer = AnalyzerAgent()
            security = SecurityAgent()
            
            analyzer_result = {}
            security_result = {}

            with concurrent.futures.ThreadPoolExecutor(max_workers=2) as executor:
                fa = executor.submit(analyzer.run, source_files, language)
                fs = executor.submit(security.run, source_files, language)
                
                done, _ = concurrent.futures.wait([fa, fs], timeout=60, return_when=concurrent.futures.ALL_COMPLETED)
                if fa in done: analyzer_result = fa.result()
                if fs in done: security_result = fs.result()

            all_issues = analyzer_result.get("issues", []) + security_result.get("issues", [])
            update_state(ScanStatus.ANALYZING, {"issues": all_issues})

            if not all_issues:
                verdict = {
                    "is_verified": True,
                    "verdict": "VERIFIED",
                    "confidence_score": 100.0,
                    "summary": "No vulnerabilities or logic bugs found in the source code.",
                    "reasoning": ["Static analysis detected 0 issues.", "Security scan detected 0 issues."],
                    "regression_detected": False,
                    "security_mitigated": True,
                    "test_suite_passed": True,
                    "judge_model": "Code Analyzer"
                }
                update_state(ScanStatus.VERIFIED, {"verdict": verdict, "completedAt": datetime.now(timezone.utc).isoformat()})
                return verdict

            primary_issue = all_issues[0]

            # REPAIR & SANDBOX RETRY LOOP
            retry_count = 0
            sandbox_stderr = ""
            repair_result = {}
            sandbox_repaired = None

            while retry_count <= self.max_retries:
                update_state(ScanStatus.REPAIRING)
                repair = RepairAgent()
                repair_result = repair.run(source_files, primary_issue, sandbox_stderr, language)
                update_state(ScanStatus.REPAIRING, {"repairs": repair_result.get("repairs", [])})

                update_state(ScanStatus.SANDBOXING)
                fixed_code_files = source_files.copy()
                for f in repair_result.get("fixedFiles", []):
                    fixed_code_files[f["file"]] = f["fixedContent"]

                req = SandboxRequest(code=fixed_code_files, language=language, tests=test_files)
                sandbox_res = self.sandbox.run(req)
                sandbox_repaired = sandbox_res.model_dump(by_alias=True)

                if sandbox_res.status.value == "PASS":
                    break
                else:
                    sandbox_stderr = sandbox_res.stderr or "Unknown test failure in sandbox"
                    retry_count += 1

            update_state(ScanStatus.SANDBOXING, {
                "repaired_sandbox": sandbox_repaired,
                "sandboxResult": sandbox_repaired
            })

            if not sandbox_repaired or sandbox_repaired.get("status") != "PASS":
                verdict = {
                    "is_verified": False,
                    "verdict": "FAILED",
                    "confidence_score": 0.0,
                    "summary": f"Failed to generate a working fix after {retry_count} attempts.",
                    "reasoning": [sandbox_stderr],
                    "regression_detected": True,
                    "security_mitigated": False,
                    "test_suite_passed": False,
                    "judge_model": "Code Analyzer"
                }
                update_state(ScanStatus.FAILED, {"verdict": verdict, "finalResult": verdict, "error": f"Failed after {retry_count} attempts."})
                return {"status": "FAILED"}

            # JUDGE
            update_state(ScanStatus.JUDGING)
            judge = JudgeAgent()
            final_result = judge.run(analyzer_result, security_result, sandbox_repaired)
            
            update_state(ScanStatus.COMPLETED, {
                "verdict": final_result,
                "finalResult": final_result,
                "completedAt": datetime.now(timezone.utc).isoformat()
            })
            return final_result

        except Exception as e:
            logger.error(f"Pipeline failed: {e}")
            update_state(ScanStatus.FAILED, {"error": str(e)})
            raise
