const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  dealerId: { type: String, default: '3000002272' }, // SR ELECTRONICS PARK
  dealerName: { type: String, default: 'SR ELECTRONICS PARK' },
  companyName: {
    type: String,
    required: true,
    enum: ['MINISTER_MYONE', 'BUTTERFLY_MARKETING', 'SALSABILAH_AMIN', 'SONALI_BANK_CSS']
  },
  bankName: { type: String, required: true },
  transactionType: { type: String, required: true }, // RTGS, NexusPay, NPSB, Dispute_Notice, Fund_Transfer
  coreTrxId: { type: String, required: true, unique: true },
  referenceLid: { type: String },
  valueDate: { type: Date, required: true },
  amount: { type: Number, required: true },
  status: {
    type: String,
    enum: ['SUCCESS', 'PAID_AND_POSTED', 'DISPUTED', 'PENDING_RESOLVE'],
    default: 'SUCCESS'
  },
  narration: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Transaction', transactionSchema);
