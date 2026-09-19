export type ScanStatus = 'QUEUED' | 'ANALYZING' | 'SECURITY_SCAN' | 'REPAIRING' | 'SANDBOX_EXECUTION' | 'JUDGING' | 'COMPLETED' | 'FAILED';

export type Severity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';

export type IssueCategory = 'SECURITY' | 'LOGIC_BUG' | 'CODE_QUALITY' | 'PERFORMANCE';

export interface Issue {
  id: string;
  category: IssueCategory;
  severity: Severity;
  title: string;
  description: string;
  file_path: string;
  line_start: number;
  line_end: number;
  cwe_id?: string;
  code_snippet?: string;
  recommendation?: string;
}

export interface RepairProposal {
  id: string;
  issue_id: string;
  file_path: string;
  original_code: string;
  repaired_code: string;
  diff: string;
  explanation: string;
  model_used: string;
}

export interface SandboxExecutionResult {
  scan_id: string;
  target_stage: 'BASELINE_ORIGINAL' | 'POST_REPAIR';
  execution_id: string;
  status: 'PASSED' | 'FAILED' | 'ERROR' | 'TIMEOUT';
  exit_code: number;
  stdout: string;
  stderr: string;
  duration_ms: number;
  memory_used_mb: number;
  tests_passed: number;
  tests_failed: number;
  sandbox_provider: 'BEDROCK_AGENTCORE' | 'LOCAL_CONTAINER' | 'MOCK_SANDBOX';
}

export interface JudgeVerdict {
  is_verified: boolean;
  verdict: 'VERIFIED' | 'REJECTED' | 'PARTIAL_FIX';
  confidence_score: number;
  summary: string;
  reasoning: string[];
  regression_detected: boolean;
  security_mitigated: boolean;
  test_suite_passed: boolean;
  judge_model: string;
  timestamp: string;
}

export interface ScanResult {
  scan_id: string;
  project_name: string;
  status: ScanStatus;
  created_at: string;
  completed_at?: string;
  duration_seconds?: number;
  issues: Issue[];
  repairs: RepairProposal[];
  baseline_sandbox?: SandboxExecutionResult;
  repaired_sandbox?: SandboxExecutionResult;
  verdict?: JudgeVerdict;
  aws_resources?: {
    bedrock_model?: string;
    agentcore_session_id?: string;
    s3_artifact_uri?: string;
    dynamodb_table?: string;
    lambda_request_id?: string;
  };
}

export interface AgentState {
  id: string;
  name: string;
  role: string;
  status: 'IDLE' | 'RUNNING' | 'COMPLETED' | 'FAILED';
  current_action?: string;
  tokens_used?: number;
  latency_ms?: number;
  model: string;
}
