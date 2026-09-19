"""Tests for scan endpoints."""


def test_create_scan(client):
    """POST /scans should create a scan and return scanId."""
    response = client.post("/scans", json={"projectName": "test-project"})
    assert response.status_code == 200
    data = response.json()
    assert "scanId" in data
    assert data["projectName"] == "test-project"
    assert data["status"] == "QUEUED"


def test_get_scan(client):
    """GET /scans/{scanId} should return scan details after creation."""
    # First create a scan
    create_resp = client.post("/scans", json={"projectName": "test-project"})
    scan_id = create_resp.json()["scanId"]

    # Then retrieve it
    response = client.get(f"/scans/{scan_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["scanId"] == scan_id
    assert data["status"] == "QUEUED"


def test_get_scan_not_found(client):
    """GET /scans/{scanId} should return 404 for unknown scan."""
    response = client.get("/scans/scan_nonexistent")
    assert response.status_code == 404





def test_create_scan_missing_name(client):
    """POST /scans should reject missing projectName."""
    response = client.post("/scans", json={})
    assert response.status_code == 422  # Validation error


def test_list_sample_projects(client):
    """GET /projects/samples should return sample projects."""
    response = client.get("/projects/samples")
    assert response.status_code == 200
    data = response.json()
    assert "projects" in data
    assert len(data["projects"]) >= 3
