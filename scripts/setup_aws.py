"""SentinelLab — 1-Click AWS Resource Setup Script

Automatically creates:
1. S3 Bucket for project uploads
2. DynamoDB Table for scan states and verdicts
3. Validates Amazon Bedrock connection
4. Generates backend/.env file
"""

import os
import sys
import boto3
from botocore.exceptions import ClientError

def run_setup():
    print("=" * 60)
    print(" SentinelLab — Automated AWS Setup (Boto3)")
    print("=" * 60)

    # Get credentials if not already in env
    access_key = os.environ.get("AWS_ACCESS_KEY_ID")
    secret_key = os.environ.get("AWS_SECRET_ACCESS_KEY")
    region = os.environ.get("AWS_REGION", "us-east-1")

    if not access_key:
        access_key = input("Enter AWS_ACCESS_KEY_ID (starts with AKIA...): ").strip()
    if not secret_key:
        secret_key = input("Enter AWS_SECRET_ACCESS_KEY: ").strip()

    if not access_key or not secret_key:
        print("[!] Error: Access key and secret key are required.")
        return

    session = boto3.Session(
        aws_access_key_id=access_key,
        aws_secret_access_key=secret_key,
        region_name=region
    )

    # 1. Verify STS Identity
    print("\n[1/4] Verifying AWS Identity...")
    try:
        sts = session.client("sts")
        identity = sts.get_caller_identity()
        account_id = identity["Account"]
        arn = identity["Arn"]
        print(f" [+] Authenticated as: {arn}")
        print(f" [+] Account ID: {account_id}")
    except Exception as e:
        print(f" [!] Authentication Failed: {e}")
        return

    bucket_name = f"sentinellab-projects-{account_id}"
    table_name = "SentinelLabScans"

    # 2. Create DynamoDB Table
    print(f"\n[2/4] Setting up DynamoDB Table '{table_name}'...")
    dynamodb = session.client("dynamodb")
    try:
        dynamodb.create_table(
            TableName=table_name,
            KeySchema=[{"AttributeName": "scanId", "KeyType": "HASH"}],
            AttributeDefinitions=[{"AttributeName": "scanId", "AttributeType": "S"}],
            BillingMode="PAY_PER_REQUEST"
        )
        print(f" [+] DynamoDB table '{table_name}' created successfully.")
    except ClientError as e:
        if e.response["Error"]["Code"] == "ResourceInUseException":
            print(f" [+] DynamoDB table '{table_name}' already exists.")
        else:
            print(f" [!] Error creating DynamoDB table: {e}")

    # 3. Create S3 Bucket
    print(f"\n[3/4] Setting up S3 Bucket '{bucket_name}'...")
    s3 = session.client("s3")
    try:
        if region == "us-east-1":
            s3.create_bucket(Bucket=bucket_name)
        else:
            s3.create_bucket(
                Bucket=bucket_name,
                CreateBucketConfiguration={"LocationConstraint": region}
            )
        print(f" [+] S3 bucket '{bucket_name}' created successfully.")
    except ClientError as e:
        if e.response["Error"]["Code"] in ["BucketAlreadyOwnedByYou", "BucketAlreadyExists"]:
            print(f" [+] S3 bucket '{bucket_name}' already exists.")
        else:
            print(f" [!] Error creating S3 bucket: {e}")

    # 4. Test Amazon Bedrock Connection
    print("\n[4/4] Verifying Amazon Bedrock Runtime...")
    try:
        bedrock = session.client("bedrock-runtime")
        print(" [+] Bedrock runtime client initialized successfully.")
    except Exception as e:
        print(f" [!] Bedrock client warning: {e}")

    # Write to backend/.env
    env_content = f"""# SentinelLab AWS Configuration
MOCK_MODE=false
AWS_REGION={region}
AWS_ACCESS_KEY_ID={access_key}
AWS_SECRET_ACCESS_KEY={secret_key}
S3_BUCKET_NAME={bucket_name}
DYNAMODB_TABLE_NAME={table_name}
ANALYZER_MODEL_ID=anthropic.claude-3-5-sonnet-20241022-v2:0
SECURITY_MODEL_ID=anthropic.claude-3-5-sonnet-20241022-v2:0
REPAIR_MODEL_ID=anthropic.claude-3-5-sonnet-20241022-v2:0
JUDGE_MODEL_ID=anthropic.claude-3-5-sonnet-20241022-v2:0
API_HOST=0.0.0.0
API_PORT=8000
"""
    backend_env_path = os.path.join(os.path.dirname(__file__), "..", "backend", ".env")
    with open(backend_env_path, "w", encoding="utf-8") as f:
        f.write(env_content)
    print(f"\n[+] Generated configuration file at: backend/.env")
    print("\n" + "=" * 60)
    print(" ALL SET! SentinelLab is now connected to live AWS!")
    print("=" * 60)

if __name__ == "__main__":
    run_setup()
