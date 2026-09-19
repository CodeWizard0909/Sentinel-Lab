import os
import sys
import json
import boto3

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'backend')))
from app.config import get_settings

def test_aws():
    s = get_settings()
    print("=" * 60)
    print(" SentinelLab — Testing Cross-Region Bedrock Inference Profile")
    print("=" * 60)

    session = boto3.Session(
        aws_access_key_id=s.aws_access_key_id or None,
        aws_secret_access_key=s.aws_secret_access_key or None,
        region_name=s.aws_region
    )

    bedrock = session.client("bedrock-runtime")

    # AWS Bedrock Cross-Region Inference profile ID for Claude 3.5 Sonnet v2
    models_to_test = [
        "us.anthropic.claude-3-5-sonnet-20241022-v2:0",
        "us.anthropic.claude-3-5-haiku-20241022-v1:0",
        "anthropic.claude-3-haiku-20240307-v1:0",
        "anthropic.claude-3-sonnet-20240229-v1:0"
    ]

    for model_id in models_to_test:
        print(f"\n[*] Probing Bedrock Model: {model_id} ...")
        try:
            payload = {
                "anthropic_version": "bedrock-2023-05-31",
                "max_tokens": 80,
                "messages": [
                    {"role": "user", "content": "You are SentinelLab AI. Say: SENTINELLAB_BEDROCK_LIVE_CONNECTED"}
                ]
            }
            res = bedrock.invoke_model(
                modelId=model_id,
                body=json.dumps(payload),
                contentType="application/json",
                accept="application/json"
            )
            data = json.loads(res["body"].read().decode())
            text = data["content"][0]["text"].strip()
            print(f" [+] SUCCESS! Model {model_id} responded:\n     \"{text}\"")
            return model_id
        except Exception as e:
            print(f" [!] Model {model_id} error: {e}")

    return None

if __name__ == "__main__":
    test_aws()
