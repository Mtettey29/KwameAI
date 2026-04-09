import random
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from .models import Vendor, Transaction, Base
from .database import engine

def seed_data(db: Session):
    # Create tables
    Base.metadata.create_all(bind=engine)

    # Check if data already exists
    if db.query(Vendor).first():
        return

    vendors = [
        {"name": "Kofi's Provisions", "business_type": "Retail", "momo_number": "233501234567"},
        {"name": "Ama's Fabrics", "business_type": "Textiles", "momo_number": "233241234567"},
        {"name": "Yaw's Repairs", "business_type": "Electronics", "momo_number": "233271234567"},
    ]

    for v_data in vendors:
        vendor = Vendor(**v_data)
        db.add(vendor)
        db.commit()
        db.refresh(vendor)

        # Generate transactions for the last 90 days
        start_date = datetime.utcnow() - timedelta(days=90)
        
        if vendor.name == "Kofi's Provisions":
            # Very consistent, daily sales
            current_date = start_date
            while current_date < datetime.utcnow():
                # Daily sale
                sale = Transaction(
                    vendor_id=vendor.id,
                    amount=random.uniform(50, 200),
                    transaction_type="incoming",
                    description="Daily sales",
                    timestamp=current_date + timedelta(hours=random.randint(8, 18))
                )
                db.add(sale)
                
                # Weekly bill payment (consistency)
                if current_date.weekday() == 0: # Monday
                    bill = Transaction(
                        vendor_id=vendor.id,
                        amount=random.uniform(100, 300),
                        transaction_type="outgoing",
                        description="Supplier payment",
                        timestamp=current_date + timedelta(hours=10)
                    )
                    db.add(bill)
                
                current_date += timedelta(days=1)
        
        elif vendor.name == "Ama's Fabrics":
            # High volume but irregular (bulky sales)
            current_date = start_date
            while current_date < datetime.utcnow():
                if random.random() < 0.2: # Only 20% of days have sales
                    sale = Transaction(
                        vendor_id=vendor.id,
                        amount=random.uniform(500, 2000),
                        transaction_type="incoming",
                        description="Bulk fabric sale",
                        timestamp=current_date + timedelta(hours=random.randint(10, 16))
                    )
                    db.add(sale)
                current_date += timedelta(days=1)
        
        elif vendor.name == "Yaw's Repairs":
            # Struggling, infrequent and small
            current_date = start_date
            while current_date < datetime.utcnow():
                if random.random() < 0.1: 
                    sale = Transaction(
                        vendor_id=vendor.id,
                        amount=random.uniform(10, 50),
                        transaction_type="incoming",
                        description="Repair fee",
                        timestamp=current_date + timedelta(hours=random.randint(10, 16))
                    )
                    db.add(sale)
                current_date += timedelta(days=1)

        db.commit()

if __name__ == "__main__":
    from .database import SessionLocal
    db = SessionLocal()
    seed_data(db)
    db.close()
