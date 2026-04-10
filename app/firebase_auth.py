import os

import firebase_admin
from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from firebase_admin import auth

security = HTTPBearer(auto_error=False)

FIREBASE_PROJECT_ID = os.getenv("FIREBASE_PROJECT_ID", "beyond-the-wallet-wa-213023930")
SKIP_FIREBASE_AUTH = os.getenv("SKIP_FIREBASE_AUTH") == "1"


def get_firebase_app():
    if not firebase_admin._apps:
        firebase_admin.initialize_app(options={"projectId": FIREBASE_PROJECT_ID})
    return firebase_admin.get_app()


def require_firebase_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(security),
) -> dict[str, object]:
    if SKIP_FIREBASE_AUTH:
        return {"uid": "test-user", "phone_number": "+233000000000"}

    if credentials is None or credentials.scheme.lower() != "bearer":
        raise HTTPException(status_code=401, detail="Firebase login is required.")

    try:
        get_firebase_app()
        decoded_token = auth.verify_id_token(credentials.credentials)
        return decoded_token
    except Exception as exc:
        raise HTTPException(status_code=401, detail="Invalid Firebase token.") from exc
