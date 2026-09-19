import { ScanResult, Issue, RepairProposal, SandboxExecutionResult, JudgeVerdict } from '../types';
import { MOCK_SCANS_RECORD, SAMPLE_PROJECTS } from '../mock/mockData';

const API_BASE_URL = '/api';

export class SentinelApiService {
  private static isMockMode: boolean = true;

  static setMockMode(enabled: boolean) {
    this.isMockMode = enabled;
  }

  static getMockMode(): boolean {
    return this.isMockMode;
  }

  static async checkHealth(): Promise<{ status: string; aws_connected: boolean; mode: string }> {
    try {
      const res = await fetch(`${API_BASE_URL}/health`);
      if (res.ok) {
        const data = await res.json();
        return { status: 'healthy', aws_connected: data.aws_connected ?? false, mode: data.mode ?? 'live' };
      }
    } catch {
      // Offline fallback
    }
    return { status: 'mock_active', aws_connected: false, mode: 'mock' };
  }

  static async getScans(): Promise<ScanResult[]> {
    try {
      if (!this.isMockMode) {
        const res = await fetch(`${API_BASE_URL}/scans`);
        if (res.ok) return await res.json();
      }
    } catch (e) {
      console.warn('Falling back to local cache', e);
    }
    return Object.values(MOCK_SCANS_RECORD);
  }

  static async getScanById(scanId: string): Promise<ScanResult | null> {
    try {
      if (!this.isMockMode) {
        const res = await fetch(`${API_BASE_URL}/scans/${scanId}`);
        if (res.ok) return await res.json();
      }
    } catch (e) {
      console.warn('API error, using mock scan', e);
    }
    return MOCK_SCANS_RECORD[scanId] || MOCK_SCANS_RECORD['scan-sample-1'] || null;
  }

  static async initiateScan(projectPayload: {
    projectName: string;
    code: string;
    testCode?: string;
    model?: string;
    sandboxProvider?: string;
  }): Promise<{ scan_id: string; status: string }> {
    const scanId = `scan-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
    
    // Create new scan record
    const newScan: ScanResult = {
      scan_id: scanId,
      project_name: projectPayload.projectName || 'Autonomous Code Verification',
      status: 'QUEUED',
      created_at: new Date().toISOString(),
      issues: [],
      repairs: [],
      aws_resources: {
        bedrock_model: projectPayload.model || 'anthropic.claude-3-5-sonnet-20241022-v2:0',
        agentcore_session_id: `agentcore-${Math.random().toString(36).substring(2, 9)}`,
        s3_artifact_uri: `s3://sentinellab-artifacts/${scanId}/bundle.zip`,
        dynamodb_table: 'sentinellab-scans',
        lambda_request_id: `lambda-${Math.random().toString(36).substring(2, 8)}`
      }
    };

    MOCK_SCANS_RECORD[scanId] = newScan;

    if (!this.isMockMode) {
      try {
        const res = await fetch(`${API_BASE_URL}/scans`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(projectPayload),
        });
        if (res.ok) {
          const data = await res.json();
          return data;
        }
      } catch (err) {
        console.warn('Using local orchestrator simulator', err);
      }
    }

    return { scan_id: scanId, status: 'QUEUED' };
  }

  // Simulated live step progression for demonstrative UX
  static async simulateScanProgress(
    scanId: string, 
    onProgress: (status: ScanResult) => void
  ): Promise<ScanResult> {
    const current = MOCK_SCANS_RECORD[scanId] || {
      scan_id: scanId,
      project_name: 'Code Verification Task',
      status: 'QUEUED',
      created_at: new Date().toISOString(),
      issues: [],
      repairs: []
    };

    const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

    // 1. Static Analysis
    current.status = 'ANALYZING';
    onProgress({ ...current });
    await sleep(1000);

    // 2. Security Vulnerability Scanning
    current.status = 'SECURITY_SCAN';
    current.issues = [
      {
        id: `iss-${Math.random().toString(36).substring(2, 6)}`,
        category: 'SECURITY',
        severity: 'CRITICAL',
        title: 'Vulnerability Detected in Execution Path',
        description: 'Analysis Agent flagged dangerous unsafe boundary evaluation and unsanitized parameters.',
        file_path: 'main.py',
        line_start: 6,
        line_end: 11,
        cwe_id: 'CWE-89 / CWE-20',
        recommendation: 'Refactor using verified immutable bindings and bounded condition check.'
      }
    ];
    onProgress({ ...current });
    await sleep(1200);

    // 3. AI Repair Generation
    current.status = 'REPAIRING';
    current.repairs = [
      {
        id: `rep-${Math.random().toString(36).substring(2, 6)}`,
        issue_id: current.issues[0]?.id || 'iss-01',
        file_path: 'main.py',
        original_code: `# Original vulnerability\nquery = f"SELECT * FROM accounts WHERE id = '{user_input}'"`,
        repaired_code: `# AI Verified Repair\nquery = "SELECT * FROM accounts WHERE id = ?"\ncursor.execute(query, (user_input,))`,
        diff: `- query = f"SELECT * FROM accounts WHERE id = '{user_input}'"\n+ query = "SELECT * FROM accounts WHERE id = ?"\n+ cursor.execute(query, (user_input,))`,
        explanation: 'Replaced dynamic concatenation with parameterized execution.',
        model_used: 'anthropic.claude-3-5-sonnet-20241022-v2:0'
      }
    ];
    onProgress({ ...current });
    await sleep(1200);

    // 4. Isolated AWS Sandbox Execution
    current.status = 'SANDBOX_EXECUTION';
    current.baseline_sandbox = {
      scan_id: scanId,
      target_stage: 'BASELINE_ORIGINAL',
      execution_id: `sb-orig-${Math.random().toString(36).substring(2, 5)}`,
      status: 'FAILED',
      exit_code: 1,
      stdout: '[AWS AgentCore Sandbox] Executing baseline unpatched source code...\n[AssertionError] Security flaw confirmed by exploit test.',
      stderr: 'Test failed: Exploit injected successfully',
      duration_ms: 1120,
      memory_used_mb: 38.4,
      tests_passed: 0,
      tests_failed: 1,
      sandbox_provider: 'BEDROCK_AGENTCORE'
    };
    current.repaired_sandbox = {
      scan_id: scanId,
      target_stage: 'POST_REPAIR',
      execution_id: `sb-rep-${Math.random().toString(36).substring(2, 5)}`,
      status: 'PASSED',
      exit_code: 0,
      stdout: '[AWS AgentCore Sandbox] Executing patched source code in isolated environment...\n[PASS] All 5 regression and security tests PASSED with zero leaks.',
      stderr: '',
      duration_ms: 860,
      memory_used_mb: 37.9,
      tests_passed: 5,
      tests_failed: 0,
      sandbox_provider: 'BEDROCK_AGENTCORE'
    };
    onProgress({ ...current });
    await sleep(1400);

    // 5. Judge Agent Verdict
    current.status = 'JUDGING';
    onProgress({ ...current });
    await sleep(1000);

    // 6. Completed
    current.status = 'COMPLETED';
    current.completed_at = new Date().toISOString();
    current.duration_seconds = 4.8;
    current.verdict = {
      is_verified: true,
      verdict: 'VERIFIED',
      confidence_score: 99.2,
      summary: 'Autonomous verification confirmed by Bedrock Judge Agent. All sandbox tests succeeded in isolated environment.',
      reasoning: [
        'Isolated AWS Bedrock AgentCore sandbox execution produced zero failures or leaks.',
        'Exploit vector was fully neutralized.',
        'No behavioral regressions identified.',
        'Verified patch is ready for automated PR generation.'
      ],
      regression_detected: false,
      security_mitigated: true,
      test_suite_passed: true,
      judge_model: 'anthropic.claude-3-5-sonnet-20241022-v2:0',
      timestamp: new Date().toISOString()
    };

    MOCK_SCANS_RECORD[scanId] = current;
    onProgress({ ...current });
    return current;
  }
}
