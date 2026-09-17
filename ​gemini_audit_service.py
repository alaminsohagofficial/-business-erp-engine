"""
Gemini Audit Service
-------------------
Module to analyze and verify ERP ledger summaries for compliance 
using the modern google-genai SDK.
"""

import os
from google import genai
from google.genai.errors import APIError

def verify_ledger_with_gemini(ledger_summary: str) -> str:
    """
    Sends an ERP ledger summary to Gemini to retrieve a compliance verification status.
    
    Args:
        ledger_summary (str): The text summary of the ledger.
        
    Returns:
        str: Gemini's compliance audit response or an error message.
    """
    # Ensure API key exists in environment
    if not os.environ.get("GEMINI_API_KEY"):
        return "Error: GEMINI_API_KEY environment variable is not set."
    
    try:
        # Initialize the Gemini client
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
        
    except APIError as e:
        return f"Gemini API Error: {e}"
    except Exception as e:
        return f"An unexpected error occurred: {e}"

if __name__ == "__main__":
    # Test execution when run directly
    summary = (
        "Dealer DEAL002905: MYONE, ELE, and PARKS ledgers are fully "
        "settled with BDT 0.00 balance and BDT 3,30,56,297.00 net advance buffer."
    )
    print("Running audit analysis...")
    result = verify_ledger_with_gemini(summary)
    print("Gemini Audit Response:\n", result)
