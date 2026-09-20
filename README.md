# 🛡️ SentinelLab

### Multi-Agent AI Software Verification Platform

> *"AI-generated fixes should not be trusted until they are tested and verified inside an isolated AWS sandbox."*

---

## 🚀 What is SentinelLab?

SentinelLab is an autonomous **multi-agent code verification platform** that discovers security vulnerabilities, synthesizes neural repairs, and verifies them through isolated AWS sandbox execution — all powered by **Amazon Bedrock** and a coordinated 5-agent AI pipeline.

### The Problem
AI coding assistants generate patches in seconds, but they **hallucinate, create silent regressions, and frequently produce fixes that fail under real runtime conditions.** Static analysis alone can't catch these — you need execution-grounded verification.

### The Solution
SentinelLab runs 5 specialized AI agents in sequence to:
1. 🔍 **Analyze** — AST parsing, dependency profiling, code hygiene scoring
2. 🔐 **Detect** — OWASP/CVE vulnerability discovery (SQL Injection, Command Injection, Path Traversal, Hardcoded Secrets)
3. 🧬 **Repair** — Autonomous neural patch synthesis with minimal, targeted unified diffs
4. 📦 **Sandbox** — Isolated AWS Bedrock AgentCore microVM execution of both original and patched code
5. ⚖️ **Judge** — Deterministic certification based on sandbox exit codes, assertions, and regression analysis

---

## 🏗️ Architecture

```
  React + TypeScript Frontend
          │
          ▼
    API Gateway HTTP API
          │
          ▼
    FastAPI + AWS Lambda (Mangum)
          │
     ┌────┼────────────────┐
     ▼    ▼         ▼      ▼
    S3  DynamoDB  Bedrock  AgentCore
                            │
                     Async Pipeline
                            │
                ┌───┬───┬───┼───┐
                ▼   ▼   ▼   ▼   ▼
             Analyzer Security Repair Sandbox Judge
                            │
                            ▼
                 Verification Report
```

---

## ☁️ AWS Services Used

| AWS Service | Role | Why It's Critical |
|---|---|---|
| **Amazon Bedrock** | Multi-Agent AI Reasoning Engine | Powers all 5 specialized agents using **Claude 3.5 Sonnet** for code analysis, vulnerability detection, repair synthesis, and judge certification |
| **Amazon Bedrock AgentCore** | Isolated Sandbox Container Engine | Provides hardened zero-trust microVMs to execute untrusted code & exploits without host risk |
| **Amazon DynamoDB** | Distributed State Store | Single-table design (`SentinelLabScans`) tracking scan lifecycles, CVEs, diffs, and verdicts with sub-10ms latency |
| **Amazon S3** | Encrypted Artifact Store | Stores uploaded code packages, unified `.patch` files, execution transcripts, and JSON audit certificates |
| **AWS Lambda** | Serverless Backend Host | Asynchronous task orchestration and scalable ASGI FastAPI execution via Mangum |
| **Amazon API Gateway** | HTTP API Endpoint | RESTful API routing with CORS, connecting the React frontend to the Lambda backend |

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS, Lucide Icons |
| **Backend** | Python 3.11, FastAPI, Pydantic v2, Boto3 |
| **AI Models** | Amazon Bedrock — Claude 3.5 Sonnet |
| **Infrastructure** | AWS Lambda, API Gateway, DynamoDB, S3 |
| **Testing** | Pytest (17 automated tests) |

---

## 🚀 Quick Start

### Prerequisites
- Python 3.11+
- Node.js 18+
- AWS CLI configured (for deployment)

### Backend
```bash
cd backend
python -m venv .venv
# Windows:
.venv\Scripts\activate
# macOS/Linux:
source .venv/bin/activate

pip install -r requirements.txt
cp ../.env.example ../.env   # Edit with your AWS credentials

# Run locally (mock mode — no AWS needed)
MOCK_MODE=true uvicorn app.main:app --reload
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Run Tests
```bash
cd backend
python -m pytest tests/ -v
```

---

## 📡 API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/health` | Health check + AWS connectivity status |
| `POST` | `/scans` | Create a new code verification scan |
| `POST` | `/scans/{scanId}/start` | Start the 5-agent verification pipeline |
| `GET` | `/scans/{scanId}` | Get scan status, results & audit report |

---

## 📁 Project Structure

```
sentinellab/
├── backend/
│   ├── app/
│   │   ├── agents/          # 5 AI Agents (Analyzer, Security, Repair, Sandbox, Judge)
│   │   ├── api/             # FastAPI routes
│   │   ├── orchestrator/    # Multi-agent pipeline coordinator
│   │   ├── schemas/         # Pydantic v2 data models
│   │   ├── services/        # AWS service integrations (Bedrock, DynamoDB, S3)
│   │   ├── config.py        # App configuration
│   │   └── main.py          # FastAPI app + Mangum Lambda handler
│   ├── tests/               # 17 automated Pytest tests
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/      # React UI components
│   │   ├── services/        # API client service
│   │   ├── mock/            # Mock data for offline development
│   │   └── types/           # TypeScript type definitions
│   └── package.json
├── scripts/                  # AWS deployment scripts
├── docs/                     # Architecture & submission docs
├── infrastructure/           # SAM/CloudFormation templates
└── sample-projects/          # Example vulnerable code for testing
```

---

## 🧪 Testing

All 17 tests pass consistently:
```bash
cd backend
python -m pytest tests/ -v
# ========================= 17 passed =========================
```

---

## 👥 Team

| Stream | Focus |
|--------|-------|
| **AI Agents** | Analyzer, Security, Repair, Judge, Bedrock prompts |
| **AWS + Sandbox** | Lambda, API Gateway, S3, DynamoDB, AgentCore |
| **Frontend** | Upload, Dashboard, Diff viewer, Results |
| **Integration** | Pipeline, API contracts, E2E tests |

---

## 📜 License

Hackathon project — built for the AWS Hackathon.
