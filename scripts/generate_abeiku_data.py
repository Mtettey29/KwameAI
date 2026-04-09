import random
from datetime import datetime, timedelta
from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os

# Use the same schema as app/models.py
Base = declarative_base()

class Vendor(Base):
    __tablename__ = "vendors"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    business_type = Column(String)
    momo_number = Column(String)

class Transaction(Base):
    __tablename__ = "transactions"
    id = Column(Integer, primary_key=True, index=True)
    vendor_id = Column(Integer)
    amount = Column(Float)
    transaction_type = Column(String)
    description = Column(String)
    timestamp = Column(DateTime)

# Setup DB connection
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./test.db")
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)

def generate_abeiku_data():
    db = SessionLocal()
    Base.metadata.create_all(bind=engine)

    # Create Abeiku if not exists
    abeiku = db.query(Vendor).filter(Vendor.name == "Abeiku").first()
    if not abeiku:
        abeiku = Vendor(name="Abeiku", business_type="Corner Store", momo_number="233201112223")
        db.add(abeiku)
        db.commit()
        db.refresh(abeiku)

    # Generate 50 transactions
    descriptions = ["Bread sale", "Milk sale", "Sugar sale", "Top-up", "Water refill", "Supplier payment", "Electricity bill"]
    
    start_date = datetime.now() - timedelta(days=60)
    
    for i in range(50):
        is_incoming = random.random() > 0.15 # 85% sales
        trans_type = "incoming" if is_incoming else "outgoing"
        desc = random.choice(descriptions[:5]) if is_incoming else random.choice(descriptions[5:])
        
        # Make Abeiku consistent - space transactions out
        timestamp = start_date + timedelta(days=i * 1.2, hours=random.randint(8, 18))
        
        transaction = Transaction(
            vendor_id=abeiku.id,
            amount=round(random.uniform(10, 150), 2) if is_incoming else round(random.uniform(200, 500), 2),
            transaction_type=trans_type,
            description=desc,
            timestamp=timestamp
        )
        db.add(transaction)

    db.commit()
    print(f"Successfully added 50 mock transactions for Abeiku (ID: {abeiku.id})")
    db.close()

if __name__ == "__main__":
    generate_abeiku_data()
