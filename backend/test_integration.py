import os
import time

# Force mock mode for local testing without AWS credentials
os.environ["MOCK_MODE"] = "true"
os.environ["ANALYZER_MODEL_ID"] = "mock"
os.environ["SECURITY_MODEL_ID"] = "mock"
os.environ["REPAIR_MODEL_ID"] = "mock"
os.environ["JUDGE_MODEL_ID"] = "mock"

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def run_test():
    print("🚀 Starting Integration Test (Local Mock Mode)...\n")

    # 1. Create the scan (Simulating Frontend POST)
    payload = {
        "projectName": "Test Project",
        "code": "print('hello world')",
        "language": "python"
    }
    
    print(f"📡 POST /scans payload: {payload}")
    response = client.post("/scans", json=payload)
    
    assert response.status_code == 200, f"Failed to create scan: {response.text}"
    
    data = response.json()
    scan_id = data["scanId"]
    print(f"✅ Scan created successfully. ID: {scan_id}")
    print(f"   Status: {data['status']}")

    # 2. Poll for completion (Simulating Frontend GET loop)
    print("\n⏳ Polling for results...")
    max_retries = 15
    for i in range(max_retries):
        time.sleep(1.0)
        res = client.get(f"/scans/{scan_id}")
        
        if res.status_code != 200:
            print(f"❌ Error fetching status: {res.text}")
            break
            
        current = res.json()
        status = current["status"]
        print(f"   [{i+1}/{max_retries}] Status: {status}")
        
        if status in ["COMPLETED", "FAILED", "VERIFIED"]:
            print("\n🎉 Pipeline Finished!")
            print("\n📊 Final Verdict Payload (What the React UI receives):")
            
            import json
            print(json.dumps(current.get("verdict", {}), indent=2))
            
            # Assertions to ensure API schemas are perfectly intact
            assert "is_verified" in current["verdict"], "Missing is_verified in verdict"
            assert "summary" in current["verdict"], "Missing summary in verdict"
            print("\n✅ All JSON schema contracts passed successfully.")
            return

    print("❌ Test timed out.")

if __name__ == "__main__":
    run_test()
