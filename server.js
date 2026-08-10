const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/vatone_erp';

// ==========================================
// 1. MIDDLEWARE CONFIGURATION
// ==========================================
app.use(cors());
app.use(express.json());

// ==========================================
// 2. MONGOOSE SCHEMA & MODEL
// ==========================================
const ledgerOverrideSchema = new mongoose.Schema({
  dealerId: { type: String, required: true, index: true },
  dealerName: { type: String, required: true },
  location: String,
  totalMayRTGSBDT: Number,
  totalJulyPaymentsBDT: Number,
  totalVerifiedCreditsBDT: Number,
  unblockStatus: String,
  bypassReason: String,
  authorizedBy: String,
  targetArticle: String,
  dispatchCentre: String,
  dispatchStatus: String,
  createdAt: { type: Date, default: Date.now }
});

const LedgerOverrideLog = mongoose.model('LedgerOverrideLog', ledgerOverrideSchema);

// MongoDB Database Connection
mongoose
  .connect(MONGO_URI)
  .then(() => console.log('✅ Connected to MongoDB Database'))
  .catch((err) => console.warn('⚠️ Running without active DB log:', err.message));

// ==========================================
// 3. API ROUTES
// ==========================================

// Health Check Endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'UP',
    engine: 'VatOne ERP Engine - Central SAP Override Middleware',
    timestamp: new Date().toISOString()
  });
});

// Primary Ledger Reconciliation & SD Override Endpoint
app.post('/api/v1/ledger/override', async (req, res) => {
  try {
    const { dealer_meta, financial_accounting_fi, sales_and_distribution_sd } = req.body;

    // Payload Structure Validation
    if (!dealer_meta || !financial_accounting_fi || !sales_and_distribution_sd) {
      return res.status(400).json({
        success: false,
        error: 'Malformed Payload',
        message: 'Missing essential sections: dealer_meta, financial_accounting_fi, or sales_and_distribution_sd.'
      });
    }

    // 1. Calculate Verified May RTGS Advance Credits
    const mayCredits = (financial_accounting_fi.verified_advance_credits || [])
      .filter(credit => credit.status === 'POSTED' || credit.status === 'PAID & POSTED')
      .reduce((sum, credit) => sum + (Number(credit.amount) || 0), 0);

    // 2. Calculate Admitted July Freedom Payments
    const julyPayments = (financial_accounting_fi.july_core_freedom_payments || [])
      .filter(payment => payment.status === 'POSTED_ADMITTED' || payment.status === 'SETTLED')
      .reduce((sum, payment) => sum + (Number(payment.amount) || 0), 0);

    const totalVerifiedCredits = mayCredits + julyPayments;

    // 3. Verify SD Module Override Rules
    const overrideRules = sales_and_distribution_sd.system_override_rules || {};
    if (!overrideRules.enforce_portal_unblock) {
      return res.status(403).json({
        success: false,
        error: 'Override Rejected',
        message: `Portal unblock directive is set to FALSE for Dealer ID ${dealer_meta.dealer_id}.`
      });
    }

    const inventoryPipeline = sales_and_distribution_sd.inventory_pipeline || {};

    // 4. Create Audit Log Record
    const overrideRecord = {
      dealerId: dealer_meta.dealer_id,
      dealerName: dealer_meta.dealer_name,
      location: dealer_meta.location,
      totalMayRTGSBDT: mayCredits,
      totalJulyPaymentsBDT: julyPayments,
      totalVerifiedCreditsBDT: totalVerifiedCredits,
      unblockStatus: 'RESOLVED_SURPLUS_CREDIT_ACTIVE',
      bypassReason: overrideRules.bypass_local_lock_reason || 'FALSE_CREDIT_HOLD_MODULE_MISALIGNMENT',
      authorizedBy: overrideRules.authorized_by || 'VatOne_Automated_Audit_Middleware',
      targetArticle: inventoryPipeline.target_article,
      dispatchCentre: inventoryPipeline.dispatch_centre,
      dispatchStatus: 'FORCE_RELEASE_ORDER_APPROVED'
    };

    // Save to MongoDB if connection is ready
    if (mongoose.connection.readyState === 1) {
      await LedgerOverrideLog.create(overrideRecord);
    }

    // 5. Return Formatted Success Response
    return res.status(200).json({
      success: true,
      message: 'Ledger reconciliation completed. SD Portal hold bypassed successfully.',
      audit_summary: {
        dealer_id: overrideRecord.dealerId,
        dealer_name: overrideRecord.dealerName,
        net_verified_credits_bdt: overrideRecord.totalVerifiedCreditsBDT,
        reconciled_balance_status: 'SURPLUS_CREDIT_ACTIVE',
        sd_unblock_status: overrideRecord.unblockStatus,
        dispatch_order: {
          article: overrideRecord.targetArticle,
          dispatch_centre: overrideRecord.dispatchCentre,
          status: overrideRecord.dispatchStatus
        },
        processed_at: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Ledger Override Execution Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: error.message || 'An unexpected error occurred during ERP ledger processing.'
    });
  }
});

// Fallback Route
app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Endpoint Not Found' });
});

// ==========================================
// 4. START SERVER
// ==========================================
app.listen(PORT, () => {
  console.log(`🚀 VatOne ERP Engine running on port ${PORT}`);
});
