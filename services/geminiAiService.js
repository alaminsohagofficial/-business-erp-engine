const { GoogleGenAI } = require("@google/genai");

// Gemini Client Initializer
const ai = new GoogleGenAI();

/**
 * Generates automated dispute notice or clearance draft for corporate finance.
 */
exports.generateDisputeNotice = async (dealerName, unpostedAmount, bankDetails) => {
  try {
    const prompt = `
      You are an automated ERP Financial Audit AI. 
      Draft a formal professional dispute notice to the corporate Finance Team.
      
      Details:
      - Dealer Name: ${dealerName}
      - Unposted/Stuck Credit Amount: BDT ${unpostedAmount}
      - Bank Reconciliation Reference: ${bankDetails}
      
      Request immediate clearance of the ERP system credit hold and release of stuck delivery gatepasses.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    return response.text;
  } catch (error) {
    console.error("Gemini AI Service Error:", error);
    throw new Error("Failed to generate AI Audit Notice.");
  }
};
