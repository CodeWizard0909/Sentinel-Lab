# SentinelLab API Contract

Base URL: `http://localhost:8000` (dev) or API Gateway URL (prod)

---

## GET /health

Health check endpoint.

**Response** `200 OK`

```json
{
  "status": "ok"
}
```

---

## POST /scans

Create a new scan.

**Request Body**

```json
{
  "projectName": "my-project"
}
```

**Response** `200 OK`

```json
{
  "scanId": "scan_abc123def456",
  "projectName": "my-project",
  "uploadUrl": "https://s3.amazonaws.com/...",
  "status": "QUEUED"
}
```

The `uploadUrl` is a presigned S3 PUT URL. Upload project source as a zip:

```bash
curl -X PUT -T project.zip "$uploadUrl"
```

---

## POST /scans/{scanId}/start

Start processing a scan.

**Response** `200 OK`

```json
{
  "scanId": "scan_abc123def456",
  "status": "ANALYZING"
}
```

**Error Responses**

- `404` — Scan not found
- `400` — Scan already started

---

## GET /scans/{scanId}

Get current scan status and results.

**Response** `200 OK`

```json
{
  "scanId": "scan_abc123def456",
  "projectName": "my-project",
  "status": "COMPLETED",
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:05:00Z",
  "issues": [
    {
      "id": "issue_1",
      "type": "SQL_INJECTION",
      "severity": "CRITICAL",
      "file": "app.py",
      "line": 6,
      "description": "SQL injection vulnerability",
      "recommendation": "Use parameterized queries"
    }
  ],
  "repairs": {
    "fixedFiles": [...],
    "diff": "...",
    "explanation": "...",
    "tests": [...]
  },
  "sandboxResult": {
    "original": {
      "status": "FAIL",
      "testsPassed": 2,
      "testsFailed": 1,
      "securityPassed": false,
      "executionTimeMs": 1523
    },
    "repaired": {
      "status": "PASS",
      "testsPassed": 3,
      "testsFailed": 0,
      "securityPassed": true,
      "executionTimeMs": 1847
    }
  },
  "finalResult": {
    "status": "VERIFIED",
    "reason": "All issues addressed. 3 tests passed, 0 failed.",
    "issuesFound": 4,
    "issuesFixed": 4,
    "testsPassed": 3,
    "testsFailed": 0,
    "securityPassed": true
  }
}
```

**Status Transitions**

```
QUEUED → ANALYZING → REPAIRING → TESTING → VERIFYING → COMPLETED
                                                    ↘ FAILED
```

---

## GET /projects/samples

List available sample projects.

**Response** `200 OK`

```json
{
  "projects": [
    {
      "name": "sql-injection",
      "description": "Python app with SQL injection vulnerability",
      "language": "python"
    }
  ]
}
```
