from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
import datetime

Base = declarative_base()

class Vendor(Base):
    __tablename__ = "vendors"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    business_type = Column(String)
    momo_number = Column(String, unique=True, index=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    transactions = relationship("Transaction", back_populates="vendor")

class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    vendor_id = Column(Integer, ForeignKey("vendors.id"))
    amount = Column(Float)
    transaction_type = Column(String)  # 'incoming' (sale), 'outgoing' (payment/bill)
    description = Column(String)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)

    vendor = relationship("Vendor", back_populates="transactions")
