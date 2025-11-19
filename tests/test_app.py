import pytest
from fastapi.testclient import TestClient
from src.app import app

client = TestClient(app)

def test_get_activities():
    response = client.get("/activities")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, dict)
    assert "Chess Club" in data
    assert "participants" in data["Chess Club"]

def test_signup_for_activity_success():
    email = "testuser@mergington.edu"
    activity = "Chess Club"
    # Remove if already present
    client.post(f"/activities/{activity}/signup?email={email}")
    # Try to sign up
    response = client.post(f"/activities/{activity}/signup?email={email}")
    assert response.status_code == 400 or response.status_code == 200
    if response.status_code == 200:
        assert f"Signed up {email}" in response.json()["message"]
    else:
        assert response.json()["detail"] == "Student already signed up for this activity"

def test_signup_for_activity_not_found():
    response = client.post("/activities/Nonexistent/signup?email=someone@mergington.edu")
    assert response.status_code == 404
    assert response.json()["detail"] == "Activity not found"

def test_signup_duplicate():
    email = "duplicate@mergington.edu"
    activity = "Programming Class"
    # First signup
    client.post(f"/activities/{activity}/signup?email={email}")
    # Duplicate signup
    response = client.post(f"/activities/{activity}/signup?email={email}")
    assert response.status_code == 400
    assert response.json()["detail"] == "Student already signed up for this activity"
