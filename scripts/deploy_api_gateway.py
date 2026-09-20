"""SentinelLab — 1-Click AWS API Gateway / Lambda Deployment Script (Boto3)

Deploys the FastAPI backend to AWS Lambda with a public HTTP endpoint (Function URL / API Gateway)
and enables full CORS for frontend access.
"""

import os
import sys
import json
import time
import zipfile
import shutil
import tempfile
import boto3
from botocore.exceptions import ClientError

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'backend')))
from app.config import get_settings

def create_lambda_role(iam_client):
    role_name = "sentinellab-api-execution-role"
    assume_role_policy = {
        "Version": "2012-10-17",
        "Statement": [
            {
                "Effect": "Allow",
                "Principal": {"Service": "lambda.amazonaws.com"},
                "Action": "sts:AssumeRole"
            }
        ]
    }
    try:
        res = iam_client.create_role(
            RoleName=role_name,
            AssumeRolePolicyDocument=json.dumps(assume_role_policy),
            Description="Execution role for SentinelLab FastAPI Lambda and Bedrock Agents"
        )
        role_arn = res["Role"]["Arn"]
        print(f" [+] Created IAM Role: {role_name}")
        
        # Attach required policies
        policies = [
            "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole",
            "arn:aws:iam::aws:policy/AmazonDynamoDBFullAccess",
            "arn:aws:iam::aws:policy/AmazonS3FullAccess",
            "arn:aws:iam::aws:policy/AmazonBedrockFullAccess"
        ]
        for p in policies:
            try:
                iam_client.attach_role_policy(RoleName=role_name, PolicyArn=p)
            except Exception as e:
                print(f" [!] Warning attaching {p}: {e}")
        
        # Give IAM a few seconds to propagate
        time.sleep(8)
        return role_arn
    except ClientError as e:
        if e.response["Error"]["Code"] == "EntityAlreadyExists":
            role = iam_client.get_role(RoleName=role_name)
            return role["Role"]["Arn"]
        else:
            raise e

def create_deployment_package():
    print("[1/3] Packaging FastAPI backend and dependencies...")
    temp_dir = tempfile.mkdtemp()
    zip_path = os.path.join(tempfile.gettempdir(), "sentinellab-backend.zip")
    if os.path.exists(zip_path):
        os.remove(zip_path)

    backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'backend'))
    
    with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as z:
        # Add app directory
        app_dir = os.path.join(backend_dir, "app")
        for root, _, files in os.walk(app_dir):
            if '__pycache__' in root:
                continue
            for file in files:
                full_path = os.path.join(root, file)
                rel_path = os.path.relpath(full_path, backend_dir)
                z.write(full_path, rel_path)

    print(f" [+] Deployment archive created: {zip_path}")
    return zip_path

def deploy_api():
    s = get_settings()
    print("=" * 65)
    print(" SentinelLab — Deploying Backend API Gateway & Lambda")
    print("=" * 65)

    session = boto3.Session(
        aws_access_key_id=s.aws_access_key_id or None,
        aws_secret_access_key=s.aws_secret_access_key or None,
        region_name=s.aws_region
    )

    iam = session.client("iam")
    lambda_client = session.client("lambda")

    print("[2/3] Setting up IAM Role & Permissions...")
    role_arn = create_lambda_role(iam)
    print(f" [+] Using Execution Role: {role_arn}")

    zip_path = create_deployment_package()
    with open(zip_path, 'rb') as f:
        zip_bytes = f.read()

    function_name = "sentinellab-api"
    env_vars = {
        "MOCK_MODE": "false",
        "AWS_REGION": s.aws_region,
        "S3_BUCKET_NAME": s.s3_bucket_name,
        "DYNAMODB_TABLE_NAME": s.dynamodb_table_name,
        "ANALYZER_MODEL_ID": s.analyzer_model_id,
        "SECURITY_MODEL_ID": s.security_model_id,
        "REPAIR_MODEL_ID": s.repair_model_id,
        "JUDGE_MODEL_ID": s.judge_model_id,
    }

    print(f"[3/3] Deploying Lambda Function '{function_name}'...")
    try:
        lambda_client.get_function(FunctionName=function_name)
        # Update existing function code & config
        lambda_client.update_function_code(
            FunctionName=function_name,
            ZipFile=zip_bytes
        )
        time.sleep(2)
        lambda_client.update_function_configuration(
            FunctionName=function_name,
            Runtime="python3.11",
            Role=role_arn,
            Handler="app.main.handler",
            Timeout=60,
            MemorySize=512,
            Environment={"Variables": env_vars}
        )
        print(f" [+] Lambda function '{function_name}' updated successfully.")
    except ClientError as e:
        if e.response["Error"]["Code"] == "ResourceNotFoundException":
            lambda_client.create_function(
                FunctionName=function_name,
                Runtime="python3.11",
                Role=role_arn,
                Handler="app.main.handler",
                Code={"ZipFile": zip_bytes},
                Timeout=60,
                MemorySize=512,
                Environment={"Variables": env_vars},
                Description="SentinelLab FastAPI Backend"
            )
            print(f" [+] Created Lambda function '{function_name}'.")
        else:
            raise e

    # Create / Get Function URL (Public HTTP API Gateway)
    try:
        url_config = lambda_client.create_function_url_config(
            FunctionName=function_name,
            AuthType="NONE",
            Cors={
                "AllowOrigins": ["*"],
                "AllowMethods": ["*"],
                "AllowHeaders": ["*"],
                "MaxAge": 300
            }
        )
        api_url = url_config["FunctionUrl"]
    except ClientError as e:
        if e.response["Error"]["Code"] == "ResourceConflictException":
            url_config = lambda_client.get_function_url_config(FunctionName=function_name)
            api_url = url_config["FunctionUrl"]
        else:
            raise e

    # Grant public invoke permission
    try:
        lambda_client.add_permission(
            FunctionName=function_name,
            StatementId="FunctionURLAllowPublicAccess",
            Action="lambda:InvokeFunctionUrl",
            Principal="*",
            FunctionUrlAuthType="NONE"
        )
    except ClientError as e:
        if e.response["Error"]["Code"] != "ResourceConflictException":
            print(f" [!] Note on permissions: {e}")

    print("\n" + "=" * 65)
    print(" 🚀 BACKEND API GATEWAY IS LIVE!")
    print("=" * 65)
    print(f" 🌐 Public API Gateway / Endpoint URL:\n    {api_url}")
    print("\n Available API Endpoints:")
    print(f"  - GET  {api_url}health")
    print(f"  - POST {api_url}scans")
    print(f"  - GET  {api_url}scans/{{scanId}}")
    print(f"  - POST {api_url}scans/{{scanId}}/start")
    print(f"  - GET  {api_url}projects/samples")
    print("=" * 65)
    return api_url

if __name__ == "__main__":
    deploy_api()
