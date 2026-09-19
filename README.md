# 🛡️ SENTINELLAB

**Multi-Agent AI Software Verification Platform**

> "AI-generated fixes should not be trusted until they are tested and verified inside an isolated sandbox."

## Architecture

```
React + TypeScript Frontend
        │
        ▼
  API Gateway HTTP API
        │
        ▼
  FastAPI + AWS Lambda
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

## Quick Start

### Prerequisites

- Python 3.11+
- Node.js 18+
- AWS CLI (for deployment)
- SAM CLI (for deployment)

### Backend

```bash
cd backend
python -m venv .venv
# Windows:
.venv\Scripts\activate
# macOS/Linux:
source .venv/bin/activate

pip install -r requirements.txt
cp ../.env.example ../.env   # Edit as needed

# Run with mock mode (no AWS needed)
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

## Team Workstreams

| Stream | Owner | Focus |
|--------|-------|-------|
| **A — AI Agents** | — | Analyzer, Security, Repair, Judge, Bedrock prompts |
| **B — AWS + Sandbox** | — | Lambda, API Gateway, S3, DynamoDB, AgentCore |
| **C — Frontend** | — | Upload, Dashboard, Diff, Results |
| **D — Integration** | — | Pipeline, API contracts, E2E tests, samples |

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/health` | Health check |
| `POST` | `/scans` | Create a new scan |
| `POST` | `/scans/{scanId}/start` | Start scan processing |
| `GET` | `/scans/{scanId}` | Get scan status & results |

## Environment Variables

See [`.env.example`](.env.example) for all configuration options.

Set `MOCK_MODE=true` for local development without AWS.

## License

Hackathon project — internal use only.
