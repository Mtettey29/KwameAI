import datetime

from sqlalchemy import Column, DateTime, Float, ForeignKey, Integer, String
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship

Base = declarative_base()

class Vendor(Base):
    __tablename__ = "vendors"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    business_type = Column(String)
    momo_number = Column(String, unique=True, index=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    transactions = relationship("Transaction", back_populates="vendor")
    consent_requests = relationship("ConsentRequest", back_populates="vendor")
    statement_uploads = relationship("StatementUpload", back_populates="vendor")

class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    vendor_id = Column(Integer, ForeignKey("vendors.id"))
    amount = Column(Float)
    transaction_type = Column(String)  # 'incoming' (sale), 'outgoing' (payment/bill)
    description = Column(String)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)

    vendor = relationship("Vendor", back_populates="transactions")


class ConsentRequest(Base):
    __tablename__ = "consent_requests"

    id = Column(Integer, primary_key=True, index=True)
    phone_number = Column(String, index=True)
    otp_code = Column(String)
    status = Column(String, default="pending", index=True)
    vendor_id = Column(Integer, ForeignKey("vendors.id"), nullable=True)
    expires_at = Column(DateTime)
    verified_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    vendor = relationship("Vendor", back_populates="consent_requests")


class StatementUpload(Base):
    __tablename__ = "statement_uploads"

    id = Column(Integer, primary_key=True, index=True)
    vendor_id = Column(Integer, ForeignKey("vendors.id"))
    provider = Column(String, index=True)
    phone_number = Column(String, index=True)
    filename = Column(String)
    mime_type = Column(String)
    status = Column(String, default="completed", index=True)
    transaction_count = Column(Integer, default=0)
    imported_count = Column(Integer, default=0)
    period_start = Column(DateTime, nullable=True)
    period_end = Column(DateTime, nullable=True)
    uploaded_at = Column(DateTime, default=datetime.datetime.utcnow)

    vendor = relationship("Vendor", back_populates="statement_uploads")
