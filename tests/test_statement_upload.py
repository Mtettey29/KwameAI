import base64
import os

os.environ["DATABASE_URL"] = "sqlite:///./test.db"
os.environ["SKIP_FIREBASE_AUTH"] = "1"

from fastapi.testclient import TestClient

from app.main import app


def test_statement_upload() -> None:
    client = TestClient(app)

    statement_text = "\n".join(
        [
            "2026-04-01 08:45 Received GHS 150.00 from Ama Enterprise Ref AAA111",
            "2026-04-02 09:15 Sent GHS 45.50 to ECG bill payment Ref BBB222",
            "2026-04-03 11:00 Received GHS 210.00 from Kojo Retail Ref CCC333",
        ]
    )

    payload = {
        "provider": "MTN MoMo",
        "phone_number": "233501234567",
        "filename": "mtn-statement.txt",
        "mime_type": "text/plain",
        "content_base64": base64.b64encode(statement_text.encode("utf-8")).decode("utf-8"),
    }

    response = client.post("/statement-uploads", json=payload)
    response.raise_for_status()
    body = response.json()

    assert body["upload"]["transaction_count"] == 3
    assert body["workspace"]["vendor"]["momo_number"] == "233501234567"
    assert body["workspace"]["sync"]["upload_count"] >= 1
    assert body["workspace"]["metrics"]["total_incoming_90d"] >= 360


if __name__ == "__main__":
    test_statement_upload()
