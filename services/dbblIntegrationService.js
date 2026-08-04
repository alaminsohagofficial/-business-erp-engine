const Transaction = require('../models/Transaction');

class ProductionReconciliationService {
    async forceClearPayment(paymentData) {
        try {
            const { transactionId, sapDocumentNo, dealerCode, dealerName, amount, bankName, utrReference } = paymentData;

            // ডাটাবেসে ডুপ্লিকেট চেক করে সরাসরি আপডেট বা সেভ করা
            const updatedTransaction = await Transaction.findOneAndUpdate(
                { transactionId },
                {
                    sapDocumentNo,
                    dealerCode,
                    dealerName,
                    amount,
                    bankName,
                    utrReference,
                    systemStatus: "RECONCILED",
                    clearanceMode: "DIRECT_BANK_LEDGER_OVERRIDE",
                    verifiedTimestamp: new Date()
                },
                { upsert: true, new: true }
            );

            console.log(`[PRODUCTION ERP] Transaction ${transactionId} successfully synced and locked to RECONCILED.`);
            return { success: true, data: updatedTransaction };
        } catch (error) {
            console.error(`[ERP ERROR] Failed to reconcile transaction: ${error.message}`);
            throw new Error(error.message);
        }
    }
}

module.exports = new ProductionReconciliationService();
