import os
from google import genai
from google.genai import types

# Initialize client ( otomatik ভাবে environment থেকে GEMINI_API_KEY পিক করবে)
client = genai.Client()


class AIControlEngine:

  @staticmethod
  async def generate_dispute_notice(data: dict) -> str:
    prompt = f"""
        You are an expert enterprise financial auditor and ERP reconciliation engine.
        Draft a formal dispute notice letter based on the following financial discrepancy details:
        
        - DBBL Trace ID: {data.get('trace_id')}
        - Dealer ID: {data.get('dealer_id')}
        - DBBL Settled Amount: BDT {data.get('dbbl_amount'):,.2f}
        - SAP Ledger Amount: BDT {data.get('sap_amount'):,.2f}
        - Variance / Discrepancy: BDT {data.get('variance_bdt'):,.2f}
        - Settlement Date: {data.get('settlement_date')}
        
        Write a professional, formal, and audit-ready Markdown letter detailing the variance, root-cause analysis, and recommended corrective action (e.g., manual journal posting or bank reconciliation realignment).
        """

    # FastAPI-এর সাথে পারফরম্যান্স ঠিক রাখতে client.aio ব্যবহার করা হয়েছে
    response = await client.aio.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt,
        config=types.GenerateContentConfig(
            temperature=0.2,  # নিখুঁত এবং ফাইন্যান্সিয়াল ডেটার জন্য কম টেম্পারেচার
            max_output_tokens=1000,
        ),
    )

    return response.text
