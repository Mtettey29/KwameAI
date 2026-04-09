import os
from sqlalchemy.orm import Session
from sqlalchemy import func
from .models import Vendor, Transaction
from datetime import datetime, timedelta
import json
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
client = OpenAI(api_key=OPENAI_API_KEY) if OPENAI_API_KEY else None

class KwameAgent:
    def __init__(self, db: Session):
        self.db = db
        self.client = client
        self.persona = """
        You are Kwame, a supportive Financial Growth Partner for informal vendors in West Africa.
        Your tone is professional, encouraging, and friendly. You understand the hustle of informal businesses.
        Your goal is to evaluate a vendor's 'Trust Score' based on their Mobile Money (MoMo) transaction history.
        
        CRITICAL SCORING LOGIC:
        - Prioritize 'Consistency' (daily/weekly activity) above all else. A vendor who sells something every day is more trustworthy than one who has one big sale a month.
        - Prioritize 'Repayment Behavior' (regular supplier or bill payments).
        - High account balances are less important than consistent cash flow.
        - Trust Score is 0-100.
        
        Output format (JSON):
        {
          "trust_score": number,
          "rationale": "Kwame's explanation in his supportive tone",
          "suggested_loan_limit": number
        }
        """

    def get_vendor_metrics(self, vendor_id: int):
        vendor = self.db.query(Vendor).filter(Vendor.id == vendor_id).first()
        if not vendor:
            return None

        ninety_days_ago = datetime.utcnow() - timedelta(days=90)
        
        # Total incoming
        total_incoming = self.db.query(func.sum(Transaction.amount)).filter(
            Transaction.vendor_id == vendor_id,
            Transaction.transaction_type == "incoming",
            Transaction.timestamp >= ninety_days_ago
        ).scalar() or 0

        # Transaction count
        incoming_count = self.db.query(func.count(Transaction.id)).filter(
            Transaction.vendor_id == vendor_id,
            Transaction.transaction_type == "incoming",
            Transaction.timestamp >= ninety_days_ago
        ).scalar() or 0

        # Days with activity
        active_days = self.db.query(func.count(func.distinct(func.date(Transaction.timestamp)))).filter(
            Transaction.vendor_id == vendor_id,
            Transaction.transaction_type == "incoming",
            Transaction.timestamp >= ninety_days_ago
        ).scalar() or 0

        # Repayment count (outgoing)
        repayment_count = self.db.query(func.count(Transaction.id)).filter(
            Transaction.vendor_id == vendor_id,
            Transaction.transaction_type == "outgoing",
            Transaction.timestamp >= ninety_days_ago
        ).scalar() or 0

        return {
            "vendor_name": vendor.name,
            "business_type": vendor.business_type,
            "total_incoming_90d": total_incoming,
            "incoming_count_90d": incoming_count,
            "active_days_90d": active_days,
            "repayment_count_90d": repayment_count,
            "consistency_ratio": active_days / 90.0
        }

    def generate_trust_score(self, vendor_id: int):
        metrics = self.get_vendor_metrics(vendor_id)
        if not metrics:
            return {"error": "Vendor not found"}

        if not self.client:
            return self._calculate_fallback_score(metrics)

        prompt = f"""
        Evaluate this vendor:
        {json.dumps(metrics, indent=2)}
        
        Remember, Kwame, be supportive! If the score is low, tell them how to improve (e.g., 'try to use your MoMo more for your daily sales').
        """

        try:
            response = self.client.chat.completions.create(
                model="gpt-4o", # Or another suitable model
                messages=[
                    {"role": "system", "content": self.persona},
                    {"role": "user", "content": prompt}
                ],
                response_format={"type": "json_object"}
            )
            return json.loads(response.choices[0].message.content)
        except Exception as e:
            # Fallback logic if API fails or for demonstration
            return self._calculate_fallback_score(metrics)

    def _calculate_fallback_score(self, metrics):
        # A simple deterministic fallback for testing or if API is down
        score = (metrics["consistency_ratio"] * 60) + (min(metrics["repayment_count_90d"] / 12.0, 1.0) * 40)
        score = min(round(score), 100)
        
        limit = (metrics["total_incoming_90d"] / 3) * (score / 100)
        
        return {
            "trust_score": score,
            "rationale": f"Kwame here! I see you've been active for {metrics['active_days_90d']} days. Your consistency is key!",
            "suggested_loan_limit": round(limit, 2)
        }
