# SentinelLab Development Guide

## Team Workstreams

### Workstream A — AI Agents
**Files:** `backend/app/agents/`, `backend/app/aws/bedrock.py`

Focus on:
- Bedrock prompts and model adapters
- Agent logic (analyzer, security, repair, judge)
- Structured JSON output
- Pydantic validation

### Workstream B — AWS + Sandbox
**Files:** `backend/app/aws/`, `backend/app/sandbox/`, `infrastructure/`, `worker/`

Focus on:
- Lambda functions
- API Gateway configuration
- S3 presigned URLs
- DynamoDB operations
- AgentCore Code Interpreter
- IAM policies

### Workstream C — Frontend
**Files:** `frontend/`

Focus on:
- Upload page
- Scan dashboard with agent pipeline
- Code diff view
- Sandbox results
- Final verification report

### Workstream D — Integration + Testing
**Files:** `backend/app/orchestrator/`, `backend/tests/`, `sample-projects/`

Focus on:
- Pipeline orchestration
- API contract validation
- End-to-end tests
- Sample vulnerable projects
- Mock mode
- Integration fixes

## Local Development

### Backend

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate   # Windows
source .venv/bin/activate # macOS/Linux

pip install -r requirements.txt

# Run with mock mode
set MOCK_MODE=true        # Windows
export MOCK_MODE=true     # macOS/Linux

uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Tests

```bash
cd backend
python -m pytest tests/ -v
```

## Mock Mode

Set `MOCK_MODE=true` to develop without AWS:
- No Bedrock API calls
- No S3/DynamoDB calls
- In-memory storage
- Deterministic agent results
- Complete pipeline simulation

## Environment Variables

See `.env.example` for all configuration options.

## Adding a New Agent

1. Create `backend/app/agents/my_agent.py`
2. Extend `BaseAgent`
3. Implement `run()` returning structured JSON
4. Add mock result method
5. Add to pipeline in `backend/app/orchestrator/pipeline.py`
6. Add tests in `backend/tests/`
