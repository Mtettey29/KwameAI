import random
from datetime import datetime, timedelta

from sqlalchemy.orm import Session

from .database import engine
from .models import Base, Transaction, Vendor


def normalize_phone_number(phone_number: str) -> str:
    digits = "".join(character for character in phone_number if character.isdigit())

    if digits.startswith("0") and len(digits) == 10:
        return f"233{digits[1:]}"

    if digits.startswith("233") and len(digits) == 12:
        return digits

    return digits


def generate_demo_otp() -> str:
    return f"{random.randint(0, 999999):06d}"


def build_savings_plan(total_incoming_90d: float, consistency_ratio: float) -> dict[str, object]:
    weekly_sweep = max(round((total_incoming_90d / 12) * 0.08, 2), 5.0)
    momentum = "High" if consistency_ratio >= 0.75 else "Building" if consistency_ratio >= 0.4 else "Early"

    return {
        "weekly_auto_save": weekly_sweep,
        "goal": "Restock buffer",
        "momentum": momentum,
        "coach_tip": (
            "Route a fixed slice of strong sales days into savings so supplier payments stay predictable."
        ),
    }


def seed_vendor_transactions(db: Session, vendor: Vendor) -> None:
    if db.query(Transaction).filter(Transaction.vendor_id == vendor.id).first():
        return

    start_date = datetime.utcnow() - timedelta(days=90)

    if vendor.name == "Kofi's Provisions":
        current_date = start_date
        while current_date < datetime.utcnow():
            db.add(Transaction(
                vendor_id=vendor.id,
                amount=random.uniform(50, 200),
                transaction_type="incoming",
                description="Daily sales",
                timestamp=current_date + timedelta(hours=random.randint(8, 18)),
            ))

            if current_date.weekday() == 0:
                db.add(Transaction(
                    vendor_id=vendor.id,
                    amount=random.uniform(100, 300),
                    transaction_type="outgoing",
                    description="Supplier payment",
                    timestamp=current_date + timedelta(hours=10),
                ))

            current_date += timedelta(days=1)
        return

    if vendor.name == "Ama's Fabrics":
        current_date = start_date
        while current_date < datetime.utcnow():
            if random.random() < 0.2:
                db.add(Transaction(
                    vendor_id=vendor.id,
                    amount=random.uniform(500, 2000),
                    transaction_type="incoming",
                    description="Bulk fabric sale",
                    timestamp=current_date + timedelta(hours=random.randint(10, 16)),
                ))
            current_date += timedelta(days=1)
        return

    if vendor.name == "Yaw's Repairs":
        current_date = start_date
        while current_date < datetime.utcnow():
            if random.random() < 0.1:
                db.add(Transaction(
                    vendor_id=vendor.id,
                    amount=random.uniform(10, 50),
                    transaction_type="incoming",
                    description="Repair fee",
                    timestamp=current_date + timedelta(hours=random.randint(10, 16)),
                ))
            current_date += timedelta(days=1)
        return

    if vendor.name == "Abeiku":
        descriptions = ["Bread sale", "Milk sale", "Sugar sale", "Top-up", "Water refill"]
        expenses = ["Supplier payment", "Electricity bill"]
        current_date = datetime.utcnow() - timedelta(days=60)

        for day in range(50):
            is_incoming = random.random() > 0.15
            db.add(Transaction(
                vendor_id=vendor.id,
                amount=round(random.uniform(10, 150), 2) if is_incoming else round(random.uniform(200, 500), 2),
                transaction_type="incoming" if is_incoming else "outgoing",
                description=random.choice(descriptions if is_incoming else expenses),
                timestamp=current_date + timedelta(days=day * 1.2, hours=random.randint(8, 18)),
            ))


def seed_data(db: Session) -> None:
    Base.metadata.create_all(bind=engine)

    vendors = [
        {"name": "Kofi's Provisions", "business_type": "Retail", "momo_number": "233501234567"},
        {"name": "Ama's Fabrics", "business_type": "Textiles", "momo_number": "233241234567"},
        {"name": "Yaw's Repairs", "business_type": "Electronics", "momo_number": "233271234567"},
        {"name": "Abeiku", "business_type": "Corner Store", "momo_number": "233201112223"},
    ]

    for vendor_data in vendors:
        vendor = db.query(Vendor).filter(Vendor.momo_number == vendor_data["momo_number"]).first()
        if not vendor:
            vendor = Vendor(**vendor_data)
            db.add(vendor)
            db.commit()
            db.refresh(vendor)

        seed_vendor_transactions(db, vendor)
        db.commit()


if __name__ == "__main__":
    from .database import SessionLocal

    db = SessionLocal()
    seed_data(db)
    db.close()
