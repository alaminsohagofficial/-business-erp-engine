const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    transactionId: { type: String, required: true, unique: true },
    sapDocumentNo: { type: String, required: true },
    dealerCode: { type: String, required: true },
    dealerName: { type: String, required: true },
    amount: { type: Number, required: true },
    bankName: { type: String, required: true },
    utrReference: { type: String, required: true },
    systemStatus: { type: String, default: 'RECONCILED' },
    clearanceMode: { type: String, default: 'DIRECT_BANK_LEDGER_OVERRIDE' },
    verifiedTimestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Transaction', transactionSchema);
