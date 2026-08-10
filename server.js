const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Basic Mongoose Schema for ERP Ledger Overrides
const LedgerSchema = new mongoose.Schema({
  dealerId: { type: String, required: true },
  dealerName: { type: String, required: true },
  totalVerifiedCreditsBDT: { type: Number, required: true },
  unblockStatus: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

const LedgerRecord = mongoose.model('LedgerRecord', LedgerSchema);

// Health Check Endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP', service: 'VatOne ERP Engine' });
});

// ERP Ledger Override API Route
app.post('/api/v1/ledger/override', async (req, res) => {
  try {
    const payload = req.body;

    const { dealer_meta, financial_accounting_fi, sales_and_distribution_sd } = payload;

    if (!dealer_meta || !financial_accounting_fi || !sales_and_distribution_sd) {
      return res.status(400).json({ error: 'Malformed payload structure.' });
    }

    // Calculate Credits
    const MayCredits = financial_accounting_fi.verified_advance_credits
      .filter(c => c.status === 'POSTED' || c.status === 'PAID & POSTED')
      .reduce((sum, c) => sum + c.amount, 0);

    const JulyPayments = financial_accounting_fi.july_core_freedom_payments
      .filter(p => p.status === 'POSTED_ADMITTED' || p.status === 'SETTLED')
      .reduce((sum, p) => sum + p.amount, 0);

    const totalCredits = MayCredits + JulyPayments;

    // Response Object
    const result = {
      dealerId: dealer_meta.dealer_id,
      dealerName: dealer_meta.dealer_name,
      totalVerifiedCreditsBDT: totalCredits,
      unblockStatus: `RESOLVED: ${sales_and_distribution_sd.system_override_rules.bypass_local_lock_reason}`,
      dispatchRelease: sales_and_distribution_sd.inventory_pipeline
    };

    // Save to Database (Optional if Mongoose is connected)
    if (mongoose.connection.readyState === 1) {
      await LedgerRecord.create(result);
    }

    res.status(200).json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ error: 'Override execution failed', details: error.message });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 VatOne ERP Engine running on port ${PORT}`);
});
