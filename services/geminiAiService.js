const { GoogleGenAI } = require('@google/genai');

class GeminiAiService {
    constructor() {
        this.ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    }

    async analyzeDispute(transactionData) {
        try {
            const prompt = `
            Analyze this corporate distribution payment transaction and ledger discrepancy:
            - Dealer Code: ${transactionData.dealerCode}
            - Transaction ID: ${transactionData.transactionId}
            - Amount: ${transactionData.amount} BDT
            - Bank UTR: ${transactionData.utrReference}
            - Status: Pending approval in third-party portal.
            
            Provide a short compliance clearance note and validation status in JSON format.
            `;

            const response = await this.ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
            });

            return {
                success: true,
                aiAnalysis: response.text,
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            console.error('Gemini AI Error:', error.message);
            return { success: false, error: error.message };
        }
    }
}

module.exports = new GeminiAiService();
