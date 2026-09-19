import { ScanResult } from '../types';

export const SAMPLE_PROJECTS = [
  {
    id: 'sample-sql-injection',
    name: 'AuthService - SQL Injection Vulnerability',
    category: 'Security Vulnerability (CWE-89)',
    description: 'Direct string concatenation in SQL queries allows unauthorized authentication bypass via SQL injection.',
    code: `import sqlite3

def authenticate_user(username, password):
    conn = sqlite3.connect('users.db')
    cursor = conn.cursor()
    # VULNERABLE: Direct string formatting into SQL query
    query = f"SELECT id, username, role FROM users WHERE username = '{username}' AND password = '{password}'"
    cursor.execute(query)
    user = cursor.fetchone()
    conn.close()
    return user

def test_auth():
    # Attempting SQL injection payload
    payload = "admin' OR '1'='1"
    res = authenticate_user(payload, "anything")
    assert res is not None, "Injection should succeed against vulnerable code"
    print("Vulnerability confirmed: Admin bypass possible!")

if __name__ == '__main__':
    test_auth()
`,
    testCode: `def test_secure_auth():
    assert authenticate_user("regular_user", "correct_pass") is not None
    assert authenticate_user("admin' OR '1'='1", "pass") is None
`
  },
  {
    id: 'sample-logic-bug',
    name: 'RateLimiter - Off-by-One Token Exhaustion',
    category: 'Logic & State Mutation Bug (CWE-193)',
    description: 'Sliding window rate limiter incorrectly decrements counter before window expiry, leading to premature rate-limit triggers.',
    code: `import time

class SlidingWindowLimiter:
    def __init__(self, limit: int, window_seconds: int):
        self.limit = limit
        self.window_seconds = window_seconds
        self.requests = []

    def allow_request(self, timestamp: float = None) -> bool:
        if timestamp is None:
            timestamp = time.time()
        
        # BUG: Uses > instead of >= and drops valid requests on exact boundary
        cutoff = timestamp - self.window_seconds
        self.requests = [t for t in self.requests if t > cutoff]
        
        # BUG: Off-by-one allowing limit + 1 requests
        if len(self.requests) > self.limit:
            return False
            
        self.requests.append(timestamp)
        return True

def test_limiter():
    limiter = SlidingWindowLimiter(limit=3, window_seconds=10)
    assert limiter.allow_request(100.0) is True
    assert limiter.allow_request(101.0) is True
    assert limiter.allow_request(102.0) is True
    # Should reject the 4th request in the same window
    allowed = limiter.allow_request(103.0)
    print(f"4th request allowed? {allowed} (Expected False)")
`,
    testCode: `def test_boundary_conditions():
    limiter = SlidingWindowLimiter(limit=2, window_seconds=5)
    assert limiter.allow_request(1.0)
    assert limiter.allow_request(2.0)
    assert not limiter.allow_request(3.0)
    # After window passes
    assert limiter.allow_request(6.1)
`
  },
  {
    id: 'sample-hardcoded-secret',
    name: 'PaymentWebhook - Hardcoded Secret & SSRF',
    category: 'Critical Secret Exposure & SSRF (CWE-798, CWE-918)',
    description: 'Webhook verification key is hardcoded in source, and webhook callback URL is fetched without domain whitelist validation.',
    code: `import urllib.request
import hmac
import hashlib

# CRITICAL SECURITY ISSUE: Hardcoded production secret
WEBHOOK_SECRET = "sk_live_98374981729384719238471"

def verify_and_forward_webhook(payload: bytes, signature: str, callback_url: str):
    computed = hmac.new(WEBHOOK_SECRET.encode(), payload, hashlib.sha256).hexdigest()
    if computed != signature:
        raise ValueError("Invalid signature")
        
    # VULNERABILITY: Unvalidated SSRF endpoint allows internal AWS metadata access (169.254.169.254)
    req = urllib.request.Request(callback_url, data=payload, headers={'Content-Type': 'application/json'})
    with urllib.request.urlopen(req, timeout=5) as response:
        return response.status
`,
    testCode: `def test_ssrf_protection():
    import pytest
    with pytest.raises(ValueError):
        verify_and_forward_webhook(b"{}", "sig", "http://169.254.169.254/latest/meta-data/")
`
  }
];

export const MOCK_SCANS_RECORD: Record<string, ScanResult> = {
  'scan-sample-1': {
    scan_id: 'scan-sample-1',
    project_name: 'AuthService - SQL Injection Vulnerability',
    status: 'COMPLETED',
    created_at: new Date(Date.now() - 45000).toISOString(),
    completed_at: new Date().toISOString(),
    duration_seconds: 4.8,
    issues: [
      {
        id: 'iss-001',
        category: 'SECURITY',
        severity: 'CRITICAL',
        title: 'SQL Injection in User Authentication Handler',
        description: 'User input from username parameter is formatted directly into an unparameterized SQL statement, enabling authentication bypass and unauthorized data access.',
        file_path: 'auth/service.py',
        line_start: 7,
        line_end: 8,
        cwe_id: 'CWE-89',
        code_snippet: 'query = f"SELECT id, username, role FROM users WHERE username = \'{username}\' AND password = \'{password}\'"',
        recommendation: 'Use parameterized queries with placeholder bindings (?) instead of string formatting.'
      },
      {
        id: 'iss-002',
        category: 'CODE_QUALITY',
        severity: 'MEDIUM',
        title: 'Plaintext Password Comparison',
        description: 'Passwords appear to be stored or compared in plaintext without cryptographic hashing (e.g., Argon2id or bcrypt).',
        file_path: 'auth/service.py',
        line_start: 7,
        line_end: 7,
        cwe_id: 'CWE-256',
        code_snippet: 'WHERE username = ... AND password = ...',
        recommendation: 'Implement secure password hashing using bcrypt or passlib.'
      }
    ],
    repairs: [
      {
        id: 'rep-001',
        issue_id: 'iss-001',
        file_path: 'auth/service.py',
        original_code: `def authenticate_user(username, password):
    conn = sqlite3.connect('users.db')
    cursor = conn.cursor()
    # VULNERABLE: Direct string formatting into SQL query
    query = f"SELECT id, username, role FROM users WHERE username = '{username}' AND password = '{password}'"
    cursor.execute(query)
    user = cursor.fetchone()
    conn.close()
    return user`,
        repaired_code: `def authenticate_user(username, password):
    conn = sqlite3.connect('users.db')
    cursor = conn.cursor()
    # REPAIRED: Parameterized query prevents SQL injection attacks
    query = "SELECT id, username, role FROM users WHERE username = ? AND password = ?"
    cursor.execute(query, (username, password))
    user = cursor.fetchone()
    conn.close()
    return user`,
        diff: `@@ -5,4 +5,4 @@
-    query = f"SELECT id, username, role FROM users WHERE username = '{username}' AND password = '{password}'"
-    cursor.execute(query)
+    query = "SELECT id, username, role FROM users WHERE username = ? AND password = ?"
+    cursor.execute(query, (username, password))`,
        explanation: 'Replaced insecure f-string SQL query concatenation with parameterized DB-API placeholders `(username, password)` to neutralize SQL injection vectors.',
        model_used: 'anthropic.claude-3-5-sonnet-20241022-v2:0'
      }
    ],
    baseline_sandbox: {
      scan_id: 'scan-sample-1',
      target_stage: 'BASELINE_ORIGINAL',
      execution_id: 'exec-orig-784',
      status: 'FAILED',
      exit_code: 1,
      stdout: `[AWS Sandbox Init] Container ID: c-bedrock-sandbox-9921
[AgentCore Sandbox] Running test suite on original source code...
[TEST RUNNER] Running test_auth()...
[SECURITY ASSERTION] Vulnerability exploited successfully:
  Admin record returned with payload: admin' OR '1'='1
[FAILED] Security regression test: SQL Injection is present.`,
      stderr: 'AssertionError: Exploit payload succeeded unexpectedly',
      duration_ms: 1240,
      memory_used_mb: 42.5,
      tests_passed: 1,
      tests_failed: 1,
      sandbox_provider: 'BEDROCK_AGENTCORE'
    },
    repaired_sandbox: {
      scan_id: 'scan-sample-1',
      target_stage: 'POST_REPAIR',
      execution_id: 'exec-rep-785',
      status: 'PASSED',
      exit_code: 0,
      stdout: `[AWS Sandbox Init] Container ID: c-bedrock-sandbox-9922
[AgentCore Sandbox] Running test suite on AI-repaired code...
[TEST RUNNER] Running test_secure_auth()...
[PASS] Normal login with valid credentials -> User(id=1, username='regular_user')
[PASS] Malicious injection payload -> None (Access Denied)
[PASS] All 6 unit and security regression assertions passed.
[SANDBOX COMPLETED] Zero security breaches detected in isolated execution.`,
      stderr: '',
      duration_ms: 980,
      memory_used_mb: 41.2,
      tests_passed: 6,
      tests_failed: 0,
      sandbox_provider: 'BEDROCK_AGENTCORE'
    },
    verdict: {
      is_verified: true,
      verdict: 'VERIFIED',
      confidence_score: 98.5,
      summary: 'The AI-generated repair successfully remediates CWE-89 SQL Injection without introducing functional regressions. All sandbox test assertions passed in isolated AWS execution.',
      reasoning: [
        'Parameterized query syntax correctly adopted DB-API compliant tuple binding.',
        'Exploit payload was executed in the sandbox and returned None, verifying the vulnerability is completely neutralized.',
        'Legitimate user authentication test passed with matching record structure.',
        'No performance degradation or additional memory footprint detected in Bedrock AgentCore execution.'
      ],
      regression_detected: false,
      security_mitigated: true,
      test_suite_passed: true,
      judge_model: 'anthropic.claude-3-5-sonnet-20241022-v2:0',
      timestamp: new Date().toISOString()
    },
    aws_resources: {
      bedrock_model: 'anthropic.claude-3-5-sonnet-20241022-v2:0',
      agentcore_session_id: 'bedrock-core-sess-a94f8b22',
      s3_artifact_uri: 's3://sentinellab-artifacts-prod/scans/scan-sample-1/audit.json',
      dynamodb_table: 'sentinellab-scans-prod',
      lambda_request_id: 'aws-lambda-req-8839-4412-bf9a'
    }
  }
};
