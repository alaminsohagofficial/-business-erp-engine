const mongoose = require('mongoose');

const reconciliationSchema = new mongoose.Schema({
  company: {
    type: String,
    required: true,
    enum: ['Minister-Myone Group', 'Butterfly Marketing Ltd', 'Salsabilah Amin Ltd']
  },
  referenceNo: { type: String, required: true, unique: true },
  amount: { type: Number, required: true },
  status: {
    type: String,
    enum: ['PENDING', 'MATCHED', 'DISCREPANCY', 'RESOLVED'],
    default: 'PENDING'
  },
  ledgerAccount: { type: String, required: true },
  matchedWith: { type: String, default: null },
  notes: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Reconciliation', reconciliationSchema);
