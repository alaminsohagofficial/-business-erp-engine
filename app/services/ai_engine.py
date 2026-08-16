from google import genai
from app.config.settings import settings

# Gemini Client ইনিশিয়ালাইজেশন
client = genai.Client(api_key=settings.GEMINI_API_KEY)


class AIControlEngine:
    """
    সালসাবিলাহ আমিন গ্রুপের বিজনেস ইঞ্জিন অডিট, রিকনসিলিয়েশন ও ডিসপিউট সার্ভিস
    """

    @staticmethod
    async def audit_transaction(payload: dict) -> str:
        prompt = f"""
        You are the Head of Control for Salsabilah Amin Group ERP.
        Analyze this ERP/VAT transaction payload for compliance, VAT calculations, and risks:
        {payload}
        Provide an executive audit summary.
        """
        # Async calls avoid blocking the FastAPI event loop
        response = await client.aio.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt,
        )
        return response.text

    @staticmethod
    async def generate_dispute_notice(dispute_payload: dict) -> str:
        """
        DBBL EFT এবং SAP Dual-Key অমিলের বিরুদ্ধে স্বয়ংক্রিয় ব্যাংক ডিসপিউট নোটিশ জেনারেট করে।
        """
        prompt = f"""
        You are the Chief Auditor at Salsabilah Amin Group.
        Draft a formal dispute letter addressed to Dutch-Bangla Bank PLC (DBBL) for an EFT Settlement Discrepancy.

        Discrepancy Details:
        - Trace ID: {dispute_payload.get('trace_id')}
        - Dealer ID: {dispute_payload.get('dealer_id')}
        - DBBL Reported Amount: {dispute_payload.get('dbbl_amount')} BDT
        - SAP Ledger Amount: {dispute_payload.get('sap_amount')} BDT
        - Variance/Discrepancy: {dispute_payload.get('variance_bdt')} BDT
        - Settlement Date: {dispute_payload.get('settlement_date')}

        Format requirements:
        - Formal corporate letterhead format.
        - Reference the DBBL Trace ID and Dealer Account.
        - Demand immediate credit adjustment or proof of settlement within 48 hours.
        """
        response = await client.aio.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt,
        )
        return response.text
