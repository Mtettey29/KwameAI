from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from .database import get_db, engine
from .models import Base, Vendor
from .agent import KwameAgent
from .utils import seed_data

from fastapi.middleware.cors import CORSMiddleware

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Beyond the Wallet API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def startup_event():
    db = next(get_db())
    seed_data(db)

@app.get("/")
def read_root():
    return {"message": "Welcome to Beyond the Wallet. Kwame is ready to help!"}

@app.get("/vendors")
def list_vendors(db: Session = Depends(get_db)):
    return db.query(Vendor).all()

from .models import Transaction

@app.get("/vendors/{vendor_id}/transactions")
def list_transactions(vendor_id: int, db: Session = Depends(get_db)):
    return db.query(Transaction).filter(Transaction.vendor_id == vendor_id).order_by(Transaction.timestamp.desc()).limit(10).all()

@app.get("/vendors/{vendor_id}/trust-score")
def get_trust_score(vendor_id: int, db: Session = Depends(get_db)):
    agent = KwameAgent(db)
    result = agent.generate_trust_score(vendor_id)
    if "error" in result:
        raise HTTPException(status_code=404, detail=result["error"])
    return result
