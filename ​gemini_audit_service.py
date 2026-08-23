import os
from google import genai

def verify_ledger_with_gemini(ledger_summary):
    # Initialize the Gemini client (expects GEMINI_API_KEY in environment variables)
    client = genai.Client()
    
    prompt = f"""
    Please analyze the following ERP ledger summary and provide a compliance verification status:
    {ledger_summary}
    """
    
    response = client.models.generate_content(
        model='gemini-2.5-flash',
        contents=prompt,
    )
    
    return response.text

if __name__ == "__main__":
    summary = "Dealer DEAL002905: MYONE, ELE, and PARKS ledgers are fully settled with BDT 0.00 balance and BDT 3,30,56,297.00 net advance buffer."
    result = verify_ledger_with_gemini(summary)
    print("Gemini Audit Response:\n", result)
