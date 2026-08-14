from google import genai
from app.config.settings import settings

# Gemini Client ইনিশিয়ালাইজেশন
client = genai.Client(api_key=settings.GEMINI_API_KEY)

class AIControlEngine:
    """
    সালসাবিলাহ আমিন গ্রুপের বিজনেস ইঞ্জিন অডিট ও কন্ট্রোল সার্ভিস
    """
    
    @staticmethod
    async def audit_transaction(payload: dict) -> str:
        prompt = f"""
        You are the Head of Control for Salsabilah Amin Group ERP.
        Analyze this ERP/VAT transaction payload for compliance, VAT calculations, and risks:
        {payload}
        Provide an executive audit summary.
        """
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt,
        )
        return response.text
