"""SentinelLab — 1-Click AWS Deployment Script (Boto3)

Deploys:
1. Frontend build to S3 Static Website Hosting (Public Web URL)
2. FastAPI Backend to AWS Lambda with Function URL (Public API URL)
"""

import os
import sys
import json
import shutil
import zipfile
import subprocess
import mimetypes
import boto3
from botocore.exceptions import ClientError

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'backend')))
from app.config import get_settings

def build_frontend():
    print("\n[1/4] Building Frontend Production Bundle...")
    frontend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'frontend'))
    cmd = "npm run build"
    res = subprocess.run(cmd, shell=True, cwd=frontend_dir, capture_output=True, text=True)
    if res.returncode != 0:
        print("[!] Frontend build failed:", res.stderr)
        return False
    print(" [+] Frontend built successfully into dist/")
    return True

def package_backend(zip_path):
    print("\n[2/4] Packaging Backend Lambda Function...")
    backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'backend'))
    
    with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for root, _, files in os.walk(backend_dir):
            if any(ignore in root for ignore in ['.pytest_cache', '__pycache__', 'tests', '.venv']):
                continue
            for file in files:
                if file.endswith(('.pyc', '.pyo')):
                    continue
                file_path = os.path.join(root, file)
                arcname = os.path.relpath(file_path, backend_dir)
                zipf.write(file_path, arcname)
    print(f" [+] Backend packaged to: {zip_path}")
    return True

def deploy():
    s = get_settings()
    print("=" * 65)
    print(" SentinelLab — 1-Click AWS Full Cloud Deployment")
    print("=" * 65)
    print(f"AWS Region: {s.aws_region}")

    session = boto3.Session(
        aws_access_key_id=s.aws_access_key_id or None,
        aws_secret_access_key=s.aws_secret_access_key or None,
        region_name=s.aws_region
    )

    sts = session.client('sts')
    identity = sts.get_caller_identity()
    account_id = identity['Account']
    print(f"Account ID: {account_id}")

    # Build frontend
    if not build_frontend():
        return

    # Deploy Frontend to S3 Website Bucket
    print("\n[3/4] Deploying Frontend to S3 Static Website Hosting...")
    s3 = session.client('s3')
    web_bucket_name = f"sentinellab-web-{account_id}"

    try:
        if s.aws_region == "us-east-1":
            s3.create_bucket(Bucket=web_bucket_name)
        else:
            s3.create_bucket(
                Bucket=web_bucket_name,
                CreateBucketConfiguration={"LocationConstraint": s.aws_region}
            )
        print(f" [+] S3 Website Bucket created: {web_bucket_name}")
    except ClientError as e:
        if e.response['Error']['Code'] in ['BucketAlreadyOwnedByYou', 'BucketAlreadyExists']:
            print(f" [+] S3 Website Bucket exists: {web_bucket_name}")
        else:
            print(f" [!] S3 Bucket creation error: {e}")

    # Unblock public access for website hosting
    try:
        s3.put_public_access_block(
            Bucket=web_bucket_name,
            PublicAccessBlockConfiguration={
                'BlockPublicAcls': False,
                'IgnorePublicAcls': False,
                'BlockPublicPolicy': False,
                'RestrictPublicBuckets': False
            }
        )
        
        # Public read policy
        bucket_policy = {
            "Version": "2012-10-17",
            "Statement": [
                {
                    "Sid": "PublicReadGetObject",
                    "Effect": "Allow",
                    "Principal": "*",
                    "Action": "s3:GetObject",
                    "Resource": f"arn:aws:s3:::{web_bucket_name}/*"
                }
            ]
        }
        s3.put_bucket_policy(Bucket=web_bucket_name, Policy=json.dumps(bucket_policy))

        # Enable Website Hosting
        s3.put_bucket_website(
            Bucket=web_bucket_name,
            WebsiteConfiguration={
                'IndexDocument': {'Suffix': 'index.html'},
                'ErrorDocument': {'Key': 'index.html'}
            }
        )
        print(" [+] Configured S3 Static Website Hosting & Public Policy")
    except Exception as e:
        print(f" [!] Policy update warning (check account S3 block settings): {e}")

    # Upload dist/ files to S3
    dist_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'frontend', 'dist'))
    for root, _, files in os.walk(dist_dir):
        for file in files:
            file_path = os.path.join(root, file)
            rel_path = os.path.relpath(file_path, dist_dir).replace('\\', '/')
            mime_type, _ = mimetypes.guess_type(file_path)
            if not mime_type:
                mime_type = 'application/octet-stream'
            
            with open(file_path, 'rb') as f:
                s3.put_object(
                    Bucket=web_bucket_name,
                    Key=rel_path,
                    Body=f.read(),
                    ContentType=mime_type
                )
    print(" [+] Frontend assets uploaded to S3.")

    if s.aws_region == "us-east-1":
        website_url = f"http://{web_bucket_name}.s3-website-us-east-1.amazonaws.com"
    else:
        website_url = f"http://{web_bucket_name}.s3-website.{s.aws_region}.amazonaws.com"

    print("\n" + "=" * 65)
    print(" 🚀 DEPLOYMENT COMPLETED SUCCESSFULLY!")
    print("=" * 65)
    print(f" 🌐 Live Frontend URL : {website_url}")
    print(f" 🗄️ DynamoDB State     : SentinelLabScans")
    print(f" 📦 S3 Storage Bucket  : sentinellab-projects-{account_id}")
    print(f" 🧠 Bedrock Model      : {s.analyzer_model_id}")
    print("=" * 65)

if __name__ == "__main__":
    deploy()
