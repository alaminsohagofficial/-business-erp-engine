const { GoogleGenAI } = require("@google/genai");

// Initialize Gemini Client (automatically reads GEMINI_API_KEY from process.env)
const ai = new GoogleGenAI();

/**
 * Generates an automated dispute notice or clearance draft for corporate finance.
 * 
 * @param {string} dealerName - Name of the dealer/distributor
 * @param {number|string} unpostedAmount - Stuck credit amount in BDT
 * @param {string} bankDetails - Bank reconciliation reference/transaction ID
 * @returns {Promise<string>} Drafted financial dispute notice
 */
exports.generateDisputeNotice = async (dealerName, unpostedAmount, bankDetails) => {
  if (!dealerName || !unpostedAmount || !bankDetails) {
    throw new Error("Missing required parameters: dealerName, unpostedAmount, and bankDetails are required.");
  }

  try {
    const prompt = `
      You are an automated ERP Financial Audit AI for an enterprise business engine.
      Draft a formal and urgent corporate financial dispute notice to the Finance & Treasury Operations Team.

      Context & Particulars:
      - Dealer/Entity Name: ${dealerName}
      - Unposted/Stuck Credit Amount: BDT ${Number(unpostedAmount).toLocaleString('en-BD')}
      - Bank Reconciliation Reference: ${bankDetails}

      Requirements:
      1. Use formal corporate Bangladesh financial terminology.
      2. Clearly state the bank reference and exact unposted credit amount.
      3. Request immediate clearance of the ERP system credit hold.
      4. Explicitly request the release of stuck delivery gatepasses to prevent supply chain bottlenecks.
      5. Include placeholder fields for Audit Ref Number and Authorized Signatory at the bottom.
    `;

    // Calling the Gemini 2.5 Flash model via the official SDK
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    return response.text;
  } catch (error) {
    console.error("🔴 Gemini AI Service Error:", error);
    throw new Error(`Failed to generate AI Audit Notice: ${error.message}`);
  }
};
