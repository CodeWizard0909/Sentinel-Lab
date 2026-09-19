# SentinelLab Infrastructure

## Prerequisites

1. [AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/install-cliv2.html) configured
2. [AWS SAM CLI](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/install-sam-cli.html)
3. AWS account with Bedrock model access enabled

## Deploy

```bash
cd infrastructure

# Build
sam build

# Deploy (first time — guided)
sam deploy --guided

# Deploy (subsequent)
sam deploy
```

## Resources Created

| Resource | Type | Purpose |
|----------|------|---------|
| `SentinelLabApi` | HTTP API Gateway | Frontend/backend communication |
| `ApiFunction` | Lambda (Python 3.11) | FastAPI API handler |
| `WorkerFunction` | Lambda (Python 3.11) | Async scan pipeline worker |
| `ProjectsBucket` | S3 Bucket | Project upload storage |
| `ScansTable` | DynamoDB Table | Scan state and results |

## AgentCore Setup

Amazon Bedrock AgentCore Code Interpreter requires separate setup:

1. Verify AgentCore availability in your region
2. Create a Code Interpreter sandbox via AWS console or SDK
3. Set the `AGENTCORE_SANDBOX_ID` environment variable on the Worker Lambda
4. See [AWS Bedrock AgentCore documentation](https://docs.aws.amazon.com/bedrock/latest/userguide/) for current setup steps

## Cleanup

```bash
sam delete
```
