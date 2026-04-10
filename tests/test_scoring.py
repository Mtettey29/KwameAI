import os

os.environ["DATABASE_URL"] = "sqlite:///./test.db"

from app.database import SessionLocal
from app.agent import KwameAgent
from app.models import Vendor

def test_scoring():
    db = SessionLocal()
    agent = KwameAgent(db)
    
    vendors = db.query(Vendor).all()
    print(f"Testing Trust Score for {len(vendors)} vendors...\n")
    
    for vendor in vendors:
        # We use the fallback logic for consistent testing without API costs/keys
        metrics = agent.get_vendor_metrics(vendor.id)
        result = agent._calculate_fallback_score(metrics)
        
        print(f"Vendor: {vendor.name} ({vendor.business_type})")
        print(f" - Active Days: {metrics['active_days_90d']}/90")
        print(f" - Repayments: {metrics['repayment_count_90d']}")
        print(f" - Total Incoming: {metrics['total_incoming_90d']:.2f}")
        print(f" - TRUST SCORE: {result['trust_score']}")
        print(f" - Kwame's Rationale: {result['rationale']}")
        print(f" - Loan Limit: {result['suggested_loan_limit']}")
        print("-" * 30)

    db.close()

if __name__ == "__main__":
    test_scoring()
