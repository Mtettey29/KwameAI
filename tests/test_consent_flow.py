import os

os.environ["DATABASE_URL"] = "sqlite:///./test.db"
os.environ["SKIP_FIREBASE_AUTH"] = "1"

from fastapi.testclient import TestClient

from app.main import app


def test_consent_flow() -> None:
    client = TestClient(app)

    response = client.post("/consent-requests", json={"phone_number": "233501234567"})
    response.raise_for_status()
    consent_request = response.json()

    verify_response = client.post(
        f"/consent-requests/{consent_request['request_id']}/verify",
        json={"otp_code": consent_request["demo_otp"]},
    )
    verify_response.raise_for_status()
    payload = verify_response.json()

    print("Consent request created:", consent_request["request_id"])
    print("Matched vendor:", payload["workspace"]["vendor"]["name"])
    print("Trust score:", payload["workspace"]["score"]["trust_score"])
    print("Weekly auto-save:", payload["workspace"]["savings_plan"]["weekly_auto_save"])


if __name__ == "__main__":
    test_consent_flow()
