import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function reconcileLedgerWithAI(centralLedger, partnerInvoices) {
  const prompt = `
    Analyze the following Central ERP ledger and Partner Invoices.
    Identify any discrepancies, matched items, and missing amounts.
    
    Central Ledger Data:
    ${JSON.stringify(centralLedger)}

    Partner Invoices:
    ${JSON.stringify(partnerInvoices)}
  `;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          totalDiscrepancyAmount: { type: Type.NUMBER },
          isBalanced: { type: Type.BOOLEAN },
          matchedCount: { type: Type.INTEGER },
          unmatchedInvoices: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                invoiceNumber: { type: Type.STRING },
                expectedAmount: { type: Type.NUMBER },
                foundAmount: { type: Type.NUMBER },
                difference: { type: Type.NUMBER },
                remarks: { type: Type.STRING }
              },
              required: ["invoiceNumber", "difference", "remarks"]
            }
          },
          summary: { type: Type.STRING }
        },
        required: ["totalDiscrepancyAmount", "isBalanced", "summary"]
      }
    }
  });

  return JSON.parse(response.text);
}
