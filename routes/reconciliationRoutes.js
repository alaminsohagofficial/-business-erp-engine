const express = require('express');
const router = express.Router();
const { reconcileLedger } = require('../controllers/reconciliationController');

/**
 * @route   POST /api/v1/reconciliation/run
 * @desc    Executes full ledger reconciliation (DBBL/IBBL SAP & Sub-ledger matching)
 * @access  Private / ERP Internal Engine
 */
router.post('/run', reconcileLedger);

/**
 * @route   GET /api/v1/reconciliation/health
 * @desc    Health check endpoint for Reconciliation Sub-system
 * @access  Public
 */
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    engine: "Reconciliation Engine v2.0",
    status: "HEALTHY",
    features: [
      "DBBL Audit Rectification",
      "IBBL SAP S/4HANA Auto-Posting",
      "Paisa-level Precision Duplicate Check"
    ],
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
