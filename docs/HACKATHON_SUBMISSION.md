# SentinelLab — AWS Hackathon Submission Kit

## 1. Project Overview

- **Project Name**: SentinelLab
- **Tagline**: Multi-Agent AI Software Verification Platform Grounded in Isolated AWS Sandboxes
- **Core Philosophy**: *"AI-generated fixes should not be trusted until they are tested and verified inside an isolated AWS sandbox."*
- **Primary AWS Track**: Generative AI, Security & Cloud-Native Modern Applications

---

## 2. Devpost / Hackathon Submission Form Content

### Elevator Pitch (Short Description)
SentinelLab is an autonomous multi-agent software verification platform that discovers code vulnerabilities, synthesizes neural repairs, and mathematically verifies them through side-by-side execution in isolated AWS Bedrock AgentCore sandboxes before issuing a cryptographic Judge certification.

### Inspiration
AI coding assistants are transforming software engineering, generating code patches in seconds. However, **AI hallucinates, creates silent regressions, and frequently produces patches that look correct but fail under real runtime edge-cases or introduce new security holes.** Current static analysis tools only guess without testing. We built SentinelLab to bring **execution-grounded verification** to autonomous AI code remediation.

### What It Does
1. **Static Analysis & AST Parsing**: Code Analysis Agent profiles abstract syntax trees, dependencies, and code hygiene.
2. **OWASP & CVE Discovery**: Security Agent flags attack vectors (CWE-89 SQL Injection, CWE-78 Command Injection, CWE-22 Path Traversal, CWE-798 Hardcoded Secrets).
3. **Autonomous Neural Patching**: Neural Repair Agent generates minimal, targeted unified diffs.
4. **Isolated AWS Sandbox Execution**: Spawns ephemeral, network-isolated AWS Bedrock AgentCore microVMs to execute both original and patched code against exploit regression test harnesses.
5. **Deterministic Judge Certification**: Verification Judge Agent certifies that the vulnerability is neutralized with 0 regressions and signs an exportable audit certificate.
6. **Interactive Real-Time Dashboard**: Cyber-security workbench featuring side-by-side code diffing, sandbox stdout/stderr execution telemetry, and confidence dials.

---

## 3. Deep AWS Architecture & Integration

SentinelLab is deeply embedded into AWS foundational services:

| AWS Service | Role in SentinelLab | Why It's Critical |
|---|---|---|
| **Amazon Bedrock** | Multi-Agent Reasoning Engine | Powers the specialized agents (Code Analyzer, Security Agent, Neural Repair, Judge) using **Claude 3.5 Sonnet**. |
| **Amazon Bedrock AgentCore** | Isolated Sandbox Container Engine | Provides hardened zero-trust microVMs to execute untrusted code & exploits without host risk. |
| **Amazon DynamoDB** | Distributed State Store (`SentinelLabScans`) | Single-table design tracking scan lifecycles, detected CVEs, unified diffs, and verdicts with sub-10ms latency. |
| **Amazon S3** | Encrypted Artifact Store | Stores uploaded code packages, unified `.patch` files, execution transcripts, and JSON audit certificates. |
| **AWS Lambda & API Gateway** | Serverless Backend Host & Worker Dispatcher | Asynchronous task orchestration and scalable ASGI FastAPI execution. |

---

## 4. How We Built It
- **Multi-Agent Orchestrator**: Python 3.11 with concurrent ThreadPool execution and iterative sandbox retry loops.
- **Backend**: FastAPI with strict Pydantic v2 schemas and Boto3 AWS SDK integrations.
- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Lucide icons, glassmorphic dark theme, and dual-slot video backdrop transitions.
- **Testing**: 17 Pytest automated test suites covering pipeline lifecycle, state mutations, and API contracts.

---

## 5. Challenges We Overcame
- **Ensuring Zero-Regressions**: Designing a closed-loop retry feedback mechanism where sandbox stderr feeds back into the Neural Repair Agent to iteratively refine patches.
- **Deterministic Judge Design**: Avoiding pure LLM guesswork by strictly basing verification on sandbox exit codes, memory quotas, and assertion pass rates.
- **Real-Time Telemetry Streaming**: Managing asynchronous state transitions across multi-agent steps and rendering them smoothly in the UI.

---

## 6. Accomplishments We're Proud Of
- 100% automated end-to-end verification pipeline from raw source code to certified patch.
- Sub-second pipeline execution with sub-10ms DynamoDB state updates.
- Sleek, cyber-security operations center (SOC) UI with interactive side-by-side diffing and exportable audit records.

---

## 7. What's Next for SentinelLab
- **GitHub Actions / GitLab CI Bot**: Auto-commenting verified `.patch` pull requests directly on repository PRs.
- **Multi-Language Runtimes**: Expanding beyond Python to Go, Rust, TypeScript, and Java sandboxes.
- **Automated Fuzzing in Sandbox**: Generating dynamic hypothesis test cases to fuzz edge cases autonomously.

---

## 8. 2-Minute Video Demo Recording Script

- **[0:00 - 0:25] The Problem**: Show vulnerable code with SQL Injection / Command Injection. Explain how AI assistants generate hallucinations without testing.
- **[0:25 - 0:45] The Solution**: Introduce SentinelLab. Open Launchpad at `http://localhost:3000` (or live AWS URL) and click *Verify in AWS Isolated Sandbox*.
- **[0:45 - 1:15] The Live Pipeline**: Show the 5-Agent Flow executing on Amazon Bedrock. Highlight real-time streaming logs.
- **[1:15 - 1:45] The Verification Audit**:
  - Show the **Judge Agent Certification** badge (99% Confidence).
  - Open **AI Patch & Code Diff** tab to display the side-by-side fix.
  - Open **AWS Isolated Sandbox Results** tab to prove Baseline Failed (Exit 1) vs Repaired Passed (Exit 0).
- **[1:45 - 2:00] AWS Architecture & Conclusion**: Show the AWS Architecture page highlighting Bedrock, AgentCore, DynamoDB, S3, and Lambda. Close with the core promise: *"Don't trust AI fixes until verified in a sandbox."*
