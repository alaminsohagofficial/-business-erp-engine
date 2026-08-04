const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  dealerId: { type: String, required: true },
  dealerName: { type: String, required: true },
  companyName: { type: String, required: true },
  bankName: { type: String, required: true },
  transactionType: { type: String, required: true },
  coreTrxId: { type: String, required: true, unique: true },
  valueDate: { type: Date, required: true },
  amount: { type: Number, required: true },
  status: { type: String, required: true },
  narration: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Transaction', transactionSchema);
