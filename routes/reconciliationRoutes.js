const express = require("express");
const router = express.Router();
const reconciliationController = require("../controllers/reconciliationController");

/**
 * @route   POST /api/reconcile/ledger
 * @desc    Reconcile Bank Transactions with ERP Ledger
 * @access  Public / Corporate Internal
 */
router.post("/ledger", reconciliationController.reconcileLedger);

module.exports = router;
