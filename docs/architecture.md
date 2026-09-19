# SentinelLab Architecture

## System Overview

SentinelLab is a multi-agent AI software verification platform that detects bugs and vulnerabilities, generates repairs, and verifies those repairs in an isolated sandbox.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend                              │
│              React + TypeScript + Tailwind                   │
│                                                              │
│  ┌──────────┐  ┌──────────────┐  ┌────────────────────────┐ │
│  │  Upload   │  │  Dashboard   │  │  Results + Code Diff   │ │
│  └──────────┘  └──────────────┘  └────────────────────────┘ │
└──────────────────────┬───────────────────────────────────────┘
                       │ HTTP (Axios)
                       ▼
              ┌─────────────────┐
              │  API Gateway    │
              │  (HTTP API)     │
              └────────┬────────┘
                       │
              ┌────────▼────────┐
              │  API Lambda     │
              │  (FastAPI +     │
              │   Mangum)       │
              └────────┬────────┘
                       │
        ┌──────────────┼──────────────┐
        │              │              │
   ┌────▼────┐  ┌─────▼─────┐  ┌────▼────────┐
   │   S3    │  │ DynamoDB  │  │   Worker    │
   │ (files) │  │ (state)   │  │   Lambda   │
   └─────────┘  └───────────┘  └────┬────────┘
                                    │
                          ┌─────────▼─────────┐
                          │  Scan Pipeline     │
                          │  (Orchestrator)    │
                          └─────────┬─────────┘
                                    │
                    ┌───────┬───────┼───────┬───────┐
                    ▼       ▼       ▼       ▼       ▼
                Analyzer Security Repair Sandbox  Judge
                 Agent    Agent   Agent  (AgentCore) Agent
                    │       │       │       │       │
                    └───────┴───────┴───────┴───────┘
                                    │
                              ┌─────▼─────┐
                              │  Bedrock  │
                              │  (LLMs)   │
                              └───────────┘
```

## Pipeline Flow

1. User uploads source code → S3
2. Scan record created → DynamoDB
3. Worker Lambda invoked asynchronously
4. Analyzer Agent examines code for bugs
5. Security Agent scans for vulnerabilities
6. Repair Agent generates fixes
7. Original code tested in AgentCore sandbox
8. Repaired code tested in AgentCore sandbox
9. Judge Agent evaluates evidence
10. Final result saved → DynamoDB
11. Frontend polls and displays results

## Key Design Decisions

| Decision | Rationale |
|----------|-----------|
| Single DynamoDB table | MVP simplicity, no joins needed |
| Async Lambda worker | Don't block API on long AI pipeline |
| Presigned S3 URLs | Secure direct upload without passing through Lambda |
| Per-agent model IDs | Swap models independently per agent |
| Sandbox abstraction | Decouple from AgentCore implementation |
| Mock mode | Develop without AWS costs |

## Security Model

- Frontend **never** accesses AWS directly
- Uploaded code **never** runs in Lambda
- Sandbox execution is fully isolated (AgentCore)
- Agent output is always validated with Pydantic
- No credentials in source code
