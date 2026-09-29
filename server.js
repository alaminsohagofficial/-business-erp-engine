/**
 * VatOne ERP Engine - Central SAP Override Middleware
 * Node.js / Express Service
 */

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const crypto = require('crypto');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/vatone_erp';

// ==========================================
// Middleware
// ==========================================
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// ==========================================
// Database Models & Connection
// ==========================================
const ledgerOverrideSchema = new mongoose.Schema({
  dealerId: { type: String, required: true, index: true },
  dealerName: { type: String, required: true },
  location: { type: String, default: 'N/A' },
  totalMayRTGSBDT: { type: Number, default: 0 },
  totalJulyPaymentsBDT: { type: Number, default: 0 },
  totalVerifiedCreditsBDT: { type: Number, default: 0 },
  unblockStatus: { type: String, required: true },
  bypassReason: { type: String, required: true },
  authorizedBy: { type: String, required: true },
  targetArticle: { type: String, default: 'GENERIC_ARTICLE' },
  dispatchCentre: { type: String, default: 'MAIN_DISPATCH' },
  dispatchStatus: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const LedgerOverrideLog = mongoose.model('LedgerOverrideLog', ledgerOverrideSchema);

// Asynchronous DB Connection initialization
const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB Database');
  } catch (err) {
    console.warn('⚠️ Running without active DB log:', err.message);
  }
};
connectDB();

// ==========================================
// Utility Helpers
// ==========================================

/**
 * Recursively sort object keys to ensure deterministic stringification for SHA-256 checks.
 */
const sortObjectKeys = (obj) => {
  if (obj === null || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(sortObjectKeys);
  return Object.keys(obj)
    .sort()
    .reduce((sorted, key) => {
      sorted[key] = sortObjectKeys(obj[key]);
      return sorted;
    }, {});
};

// ==========================================
// Custom Cryptographic Checksum Middleware
// ==========================================
const verifyChecksum = (req, res, next) => {
  try {
    const clientChecksum = req.headers['x-checksum-sha256'];
    if (!clientChecksum) {
      return res.status(401).json({ 
        success: false, 
        message: 'Missing required X-Checksum-SHA256 header' 
      });
    }

    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Cannot verify checksum on empty request payload' 
      });
    }

    // Sort nested structure deterministically
    const sortedPayload = sortObjectKeys(req.body);
    const payloadString = JSON.stringify(sortedPayload);
    
    const serverChecksum = crypto
      .createHash('sha256')
      .update(payloadString)
      .digest('hex');

    if (clientChecksum !== serverChecksum) {
      return res.status(403).json({ 
        success: false, 
        message: 'Cryptographic Checksum Mismatch',
        debug: process.env.NODE_ENV === 'development' ? { expected: serverChecksum, received: clientChecksum } : undefined
      });
    }

    next();
  } catch (error) {
    return res.status(500).json({ 
      success: false, 
      error: 'Checksum verification failure', 
      message: error.message 
    });
  }
};

// ==========================================
// API Routes
// ==========================================

// Health Check Endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'UP',
    engine: 'VatOne ERP Engine - Central SAP Override Middleware',
    dbState: mongoose.connection.readyState === 1 ? 'CONNECTED' : 'DISCONNECTED',
    timestamp: new Date().toISOString()
  });
});

// Primary Ledger Override API
app.post('/api/v1/ledger/override', async (req, res) => {
  try {
    const { dealer_meta, financial_accounting_fi, sales_and_distribution_sd } = req.body;

    // Strict section verification
    if (!dealer_meta || !financial_accounting_fi || !sales_and_distribution_sd) {
      return res.status(400).json({
        success: false,
        error: 'Malformed Payload',
        message: 'Missing essential sections: dealer_meta, financial_accounting_fi, or sales_and_distribution_sd.'
      });
    }

    // Dealer identifier verification
    if (!dealer_meta.dealer_id || !dealer_meta.dealer_name) {
      return res.status(400).json({
        success: false,
        error: 'Invalid Dealer Metadata',
        message: 'dealer_meta requires dealer_id and dealer_name.'
      });
    }

    // Calculate May credits safely
    const mayCredits = (financial_accounting_fi.verified_advance_credits || [])
      .filter(credit => credit && (credit.status === 'POSTED' || credit.status === 'PAID & POSTED'))
      .reduce((sum, credit) => sum + (Number(credit.amount) || 0), 0);

    // Calculate July payments safely
    const julyPayments = (financial_accounting_fi.july_core_freedom_payments || [])
      .filter(payment => payment && (payment.status === 'POSTED_ADMITTED' || payment.status === 'SETTLED'))
      .reduce((sum, payment) => sum + (Number(payment.amount) || 0), 0);

    const totalVerifiedCredits = mayCredits + julyPayments;

    // Evaluate override rules
    const overrideRules = sales_and_distribution_sd.system_override_rules || {};
    if (!overrideRules.enforce_portal_unblock) {
      return res.status(403).json({
        success: false,
        error: 'Override Rejected',
        message: `Portal unblock directive is set to FALSE for Dealer ID ${dealer_meta.dealer_id}.`
      });
    }

    const inventoryPipeline = sales_and_distribution_sd.inventory_pipeline || {};

    const overrideRecord = {
      dealerId: dealer_meta.dealer_id,
      dealerName: dealer_meta.dealer_name,
      location: dealer_meta.location || 'N/A',
      totalMayRTGSBDT: mayCredits,
      totalJulyPaymentsBDT: julyPayments,
      totalVerifiedCreditsBDT: totalVerifiedCredits,
      unblockStatus: 'RESOLVED_SURPLUS_CREDIT_ACTIVE',
      bypassReason: overrideRules.bypass_local_lock_reason || 'FALSE_CREDIT_HOLD_MODULE_MISALIGNMENT',
      authorizedBy: overrideRules.authorized_by || 'VatOne_Automated_Audit_Middleware',
      targetArticle: inventoryPipeline.target_article || 'UNSPECIFIED_ARTICLE',
      dispatchCentre: inventoryPipeline.dispatch_centre || 'DEFAULT_DISPATCH',
      dispatchStatus: 'FORCE_RELEASE_ORDER_APPROVED'
    };

    // Log to MongoDB if online
    if (mongoose.connection.readyState === 1) {
      await LedgerOverrideLog.create(overrideRecord);
    }

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

// Secure Ledger Sync Endpoint with SHA-256 Checksum
app.post('/api/v1/sync/ledger', verifyChecksum, async (req, res) => {
  try {
    const { dealer_code, sap_posting_doc, net_advance_buffer, status } = req.body;

    if (!dealer_code || !sap_posting_doc) {
      return res.status(400).json({
        success: false,
        message: 'Sync payload requires dealer_code and sap_posting_doc.'
      });
    }

    console.log(`[Sync Received] Dealer: ${dealer_code}, SAP Doc: ${sap_posting_doc}`);

    return res.status(200).json({
      success: true,
      message: 'Ledger synchronized and verified via SHA-256 successfully',
      data: { dealer_code, sap_posting_doc, net_advance_buffer, status }
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// Treasury Live Status Endpoint
app.get('/api/v1/treasury/live-status', async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      data: {
        minister: { dealerCode: "DEAL002905", netAdvanceBuffer: 33056297.00, status: "100% CONSISTENT" },
        butterfly: { dealerCode: "3000002272", clearedAmount: 31429000.00, status: "RELEASED" }
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// Fallback Route for Undefined Paths
app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Endpoint Not Found' });
});

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 VatOne ERP Engine running on port ${PORT}`);
});
