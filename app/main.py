import base64
from datetime import datetime, timedelta

from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy.orm import Session

from .agent import KwameAgent
from .database import engine, get_db
from .firebase_auth import require_firebase_user
from .models import Base, ConsentRequest, StatementUpload, Transaction, Vendor
from .statement_parser import ParsedStatementTransaction, parse_statement_file
from .utils import build_savings_plan, generate_demo_otp, normalize_phone_number, seed_data

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Beyond the Wallet API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ConsentRequestCreate(BaseModel):
    phone_number: str


class ConsentVerification(BaseModel):
    otp_code: str


class StatementUploadCreate(BaseModel):
    provider: str
    phone_number: str
    filename: str
    mime_type: str
    content_base64: str


def mask_phone_number(phone_number: str) -> str:
    if len(phone_number) < 4:
        return phone_number
    return f"{phone_number[:3]}****{phone_number[-4:]}"


def get_vendor_sync_summary(vendor: Vendor | None, db: Session) -> dict[str, object]:
    if vendor is None:
        return {
            "status": "never_synced",
            "last_uploaded_at": None,
            "latest_transaction_at": None,
            "upload_count": 0,
            "transaction_count": 0,
            "provider": None,
            "refresh_hint": "Upload a statement to start building your wallet ledger.",
        }

    latest_upload = (
        db.query(StatementUpload)
        .filter(StatementUpload.vendor_id == vendor.id)
        .order_by(StatementUpload.uploaded_at.desc())
        .first()
    )
    latest_transaction_at = (
        db.query(Transaction.timestamp)
        .filter(Transaction.vendor_id == vendor.id)
        .order_by(Transaction.timestamp.desc())
        .limit(1)
        .scalar()
    )
    upload_count = db.query(StatementUpload).filter(StatementUpload.vendor_id == vendor.id).count()
    transaction_count = db.query(Transaction).filter(Transaction.vendor_id == vendor.id).count() if latest_upload else 0

    if latest_upload is None:
        return {
            "status": "never_synced",
            "last_uploaded_at": None,
            "latest_transaction_at": None,
            "upload_count": 0,
            "transaction_count": 0,
            "provider": None,
            "refresh_hint": "Upload a statement to bring in your latest wallet activity.",
        }

    status = "current"
    refresh_hint = "Upload a newer statement whenever your latest wallet activity moves forward."
    if latest_transaction_at is None or latest_transaction_at < datetime.utcnow() - timedelta(days=7):
        status = "stale"
        refresh_hint = "Your statement data is older than a week. Upload a newer statement to refresh the score."

    return {
        "status": status,
        "last_uploaded_at": latest_upload.uploaded_at,
        "latest_transaction_at": latest_transaction_at,
        "upload_count": upload_count,
        "transaction_count": transaction_count,
        "provider": latest_upload.provider,
        "refresh_hint": refresh_hint,
    }


def build_vendor_workspace(vendor: Vendor, db: Session) -> dict[str, object]:
    agent = KwameAgent(db)
    metrics = agent.get_vendor_metrics(vendor.id)
    trust_score = agent.generate_trust_score(vendor.id)
    recent_transactions = (
        db.query(Transaction)
        .filter(Transaction.vendor_id == vendor.id)
        .order_by(Transaction.timestamp.desc())
        .limit(10)
        .all()
    )

    return {
        "vendor": {
            "id": vendor.id,
            "name": vendor.name,
            "business_type": vendor.business_type,
            "momo_number": vendor.momo_number,
        },
        "score": trust_score,
        "metrics": metrics,
        "transactions": [
            {
                "id": transaction.id,
                "amount": transaction.amount,
                "transaction_type": transaction.transaction_type,
                "description": transaction.description,
                "timestamp": transaction.timestamp,
            }
            for transaction in recent_transactions
        ],
        "savings_plan": build_savings_plan(
            metrics["total_incoming_90d"],
            metrics["consistency_ratio"],
        ),
        "improvement_actions": [
            "Keep routing daily sales through MoMo so your cash flow stays visible.",
            "Make supplier and utility payments on the same wallet to strengthen repayment behavior.",
            "Build a weekly buffer before taking larger short-term inventory loans.",
        ],
        "sync": get_vendor_sync_summary(vendor, db),
    }


def serialize_consent_request(
    consent_request: ConsentRequest,
    vendor: Vendor | None,
    *,
    include_demo_otp: bool = False,
) -> dict[str, object]:
    payload: dict[str, object] = {
        "request_id": consent_request.id,
        "status": consent_request.status,
        "phone_number": consent_request.phone_number,
        "masked_phone_number": mask_phone_number(consent_request.phone_number),
        "expires_at": consent_request.expires_at,
        "created_at": consent_request.created_at,
        "vendor_preview": (
            {
                "name": vendor.name,
                "business_type": vendor.business_type,
            }
            if vendor
            else None
        ),
        "approval_message": (
            "We have sent a consent OTP to the MoMo contact so transaction access can be approved."
        ),
    }

    if include_demo_otp:
        payload["demo_otp"] = consent_request.otp_code

    return payload


def resolve_vendor_for_wallet(db: Session, phone_number: str, provider: str | None = None) -> Vendor:
    vendor = db.query(Vendor).filter(Vendor.momo_number == phone_number).first()
    if vendor is not None:
        return vendor

    provider_name = (provider or "MoMo").strip() or "MoMo"
    vendor = Vendor(
        name=f"{provider_name} wallet {phone_number[-4:]}",
        business_type="Imported statement",
        momo_number=phone_number,
    )
    db.add(vendor)
    db.commit()
    db.refresh(vendor)
    return vendor


def merge_statement_transactions(
    db: Session,
    vendor: Vendor,
    transactions: list[ParsedStatementTransaction],
) -> tuple[int, datetime | None, datetime | None]:
    imported_count = 0
    timestamps = [transaction.timestamp for transaction in transactions]

    for transaction in transactions:
        existing = (
            db.query(Transaction)
            .filter(
                Transaction.vendor_id == vendor.id,
                Transaction.amount == transaction.amount,
                Transaction.transaction_type == transaction.transaction_type,
                Transaction.description == transaction.description,
                Transaction.timestamp == transaction.timestamp,
            )
            .first()
        )
        if existing is not None:
            continue

        db.add(
            Transaction(
                vendor_id=vendor.id,
                amount=transaction.amount,
                transaction_type=transaction.transaction_type,
                description=transaction.description,
                timestamp=transaction.timestamp,
            )
        )
        imported_count += 1

    db.commit()

    if not timestamps:
        return imported_count, None, None

    return imported_count, min(timestamps), max(timestamps)


@app.on_event("startup")
def startup_event() -> None:
    db = next(get_db())
    seed_data(db)


@app.get("/")
def read_root() -> dict[str, str]:
    return {"message": "Welcome to Beyond the Wallet. Kwame is ready to help!"}


@app.get("/vendors")
def list_vendors(db: Session = Depends(get_db)):
    return db.query(Vendor).all()


@app.get("/demo-accounts")
def list_demo_accounts(db: Session = Depends(get_db)) -> list[dict[str, str]]:
    vendors = db.query(Vendor).order_by(Vendor.id.asc()).all()
    return [
        {
            "name": vendor.name,
            "business_type": vendor.business_type,
            "phone_number": vendor.momo_number,
        }
        for vendor in vendors
    ]


@app.get("/statement-sync-status")
def get_statement_sync_status(
    phone_number: str | None = None,
    db: Session = Depends(get_db),
    firebase_user: dict[str, object] = Depends(require_firebase_user),
) -> dict[str, object]:
    normalized_phone_number = normalize_phone_number(
        phone_number or str(firebase_user.get("phone_number", ""))
    )
    vendor = db.query(Vendor).filter(Vendor.momo_number == normalized_phone_number).first()
    if vendor is None:
        return {
            "phone_number": normalized_phone_number,
            "workspace": None,
            "sync": get_vendor_sync_summary(None, db),
        }

    has_statement_upload = (
        db.query(StatementUpload.id).filter(StatementUpload.vendor_id == vendor.id).first() is not None
    )

    return {
        "phone_number": normalized_phone_number,
        "workspace": build_vendor_workspace(vendor, db) if has_statement_upload else None,
        "sync": get_vendor_sync_summary(vendor, db),
    }


@app.post("/statement-uploads")
def upload_statement(
    payload: StatementUploadCreate,
    db: Session = Depends(get_db),
    firebase_user: dict[str, object] = Depends(require_firebase_user),
) -> dict[str, object]:
    normalized_phone_number = normalize_phone_number(payload.phone_number)
    if len(normalized_phone_number) < 10:
        raise HTTPException(status_code=400, detail="Enter a valid wallet number before uploading a statement.")

    try:
        raw_bytes = base64.b64decode(payload.content_base64, validate=True)
    except Exception as exc:
        raise HTTPException(status_code=400, detail="The uploaded statement could not be decoded.") from exc

    if not raw_bytes:
        raise HTTPException(status_code=400, detail="The uploaded statement file is empty.")

    try:
        parsed_transactions = parse_statement_file(payload.filename, payload.mime_type, raw_bytes)
    except Exception as exc:
        raise HTTPException(status_code=400, detail="The statement format could not be parsed yet.") from exc

    if not parsed_transactions:
        raise HTTPException(
            status_code=400,
            detail="No transactions were detected in the uploaded statement. Try a clearer PDF, CSV, or text export.",
        )

    vendor = resolve_vendor_for_wallet(db, normalized_phone_number, payload.provider)
    imported_count, period_start, period_end = merge_statement_transactions(db, vendor, parsed_transactions)

    upload = StatementUpload(
        vendor_id=vendor.id,
        provider=payload.provider.strip(),
        phone_number=normalized_phone_number,
        filename=payload.filename,
        mime_type=payload.mime_type,
        status="completed",
        transaction_count=len(parsed_transactions),
        imported_count=imported_count,
        period_start=period_start,
        period_end=period_end,
    )
    db.add(upload)
    db.commit()
    db.refresh(upload)

    return {
        "detail": (
            f"Statement synced. Imported {imported_count} new transactions"
            if imported_count
            else "Statement checked. No new transactions were added."
        ),
        "workspace": build_vendor_workspace(vendor, db),
        "sync": get_vendor_sync_summary(vendor, db),
        "upload": {
            "provider": upload.provider,
            "filename": upload.filename,
            "uploaded_at": upload.uploaded_at,
            "transaction_count": upload.transaction_count,
            "imported_count": upload.imported_count,
            "period_start": upload.period_start,
            "period_end": upload.period_end,
        },
    }


@app.post("/consent-requests")
def create_consent_request(
    payload: ConsentRequestCreate,
    db: Session = Depends(get_db),
    firebase_user: dict[str, object] = Depends(require_firebase_user),
) -> dict[str, object]:
    normalized_phone_number = normalize_phone_number(payload.phone_number)
    if len(normalized_phone_number) < 10:
        raise HTTPException(status_code=400, detail="Enter a valid telephone number.")

    vendor = db.query(Vendor).filter(Vendor.momo_number == normalized_phone_number).first()

    pending_requests = (
        db.query(ConsentRequest)
        .filter(
            ConsentRequest.phone_number == normalized_phone_number,
            ConsentRequest.status == "pending",
        )
        .all()
    )
    for request in pending_requests:
        request.status = "expired"

    consent_request = ConsentRequest(
        phone_number=normalized_phone_number,
        otp_code=generate_demo_otp(),
        status="pending",
        vendor_id=vendor.id if vendor else None,
        expires_at=datetime.utcnow() + timedelta(minutes=10),
    )
    db.add(consent_request)
    db.commit()
    db.refresh(consent_request)

    response = serialize_consent_request(consent_request, vendor, include_demo_otp=True)
    if vendor is None:
        response["approval_message"] = (
            "Consent request created. This number is not linked to a seeded demo wallet yet, so verification will stop at consent."
        )

    return response


@app.get("/consent-requests/{request_id}")
def get_consent_request(
    request_id: int,
    db: Session = Depends(get_db),
    firebase_user: dict[str, object] = Depends(require_firebase_user),
) -> dict[str, object]:
    consent_request = db.query(ConsentRequest).filter(ConsentRequest.id == request_id).first()
    if not consent_request:
        raise HTTPException(status_code=404, detail="Consent request not found.")

    if consent_request.status == "pending" and consent_request.expires_at < datetime.utcnow():
        consent_request.status = "expired"
        db.commit()
        db.refresh(consent_request)

    vendor = db.query(Vendor).filter(Vendor.id == consent_request.vendor_id).first() if consent_request.vendor_id else None
    return serialize_consent_request(consent_request, vendor, include_demo_otp=True)


@app.post("/consent-requests/{request_id}/verify")
def verify_consent_request(
    request_id: int,
    payload: ConsentVerification,
    db: Session = Depends(get_db),
    firebase_user: dict[str, object] = Depends(require_firebase_user),
) -> dict[str, object]:
    consent_request = db.query(ConsentRequest).filter(ConsentRequest.id == request_id).first()
    if not consent_request:
        raise HTTPException(status_code=404, detail="Consent request not found.")

    if consent_request.status != "pending":
        raise HTTPException(status_code=400, detail="This consent request is no longer pending.")

    if consent_request.expires_at < datetime.utcnow():
        consent_request.status = "expired"
        db.commit()
        raise HTTPException(status_code=400, detail="This OTP has expired. Please request a new one.")

    if payload.otp_code.strip() != consent_request.otp_code:
        raise HTTPException(status_code=400, detail="Incorrect OTP. Please try again.")

    consent_request.status = "approved"
    consent_request.verified_at = datetime.utcnow()
    db.commit()
    db.refresh(consent_request)

    vendor = db.query(Vendor).filter(Vendor.id == consent_request.vendor_id).first() if consent_request.vendor_id else None
    if vendor is None:
        return {
            **serialize_consent_request(consent_request, None),
            "insights_ready": False,
            "detail": "Consent approved, but this demo phone number is not linked to seeded MoMo activity yet.",
        }

    workspace = build_vendor_workspace(vendor, db)
    return {
        **serialize_consent_request(consent_request, vendor),
        "insights_ready": True,
        "workspace": workspace,
    }


@app.get("/vendors/{vendor_id}/transactions")
def list_transactions(vendor_id: int, db: Session = Depends(get_db)):
    return (
        db.query(Transaction)
        .filter(Transaction.vendor_id == vendor_id)
        .order_by(Transaction.timestamp.desc())
        .limit(10)
        .all()
    )


@app.get("/vendors/{vendor_id}/trust-score")
def get_trust_score(vendor_id: int, db: Session = Depends(get_db)) -> dict[str, object]:
    agent = KwameAgent(db)
    result = agent.generate_trust_score(vendor_id)
    if "error" in result:
        raise HTTPException(status_code=404, detail=result["error"])
    return result
