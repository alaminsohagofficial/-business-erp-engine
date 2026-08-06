const express = require('express');
const router = express.Router();

/**
 * @route   GET /api/v1/reconciliation/status
 * @desc    Fetch ledger reconciliation summary
 */
router.get('/status', (req, res) => {
  res.status(200).json({
    success: true,
    reconciliationEngine: "Active",
    supportedPartners: [
      "Minister Myone Group",
      "Butterfly Marketing Ltd"
    ],
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
