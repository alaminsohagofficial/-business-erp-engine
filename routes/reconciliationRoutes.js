const express = require('express');
const router = express.Router();

// DBBL Audit API
router.get('/dbbl-audit', (req, res) => {
    res.json({
        success: true,
        auditRef: "DBBL/HO/SYS-AUDIT/2026/10925-AMEND",
        accountNumber: "7017511802593",
        accountHolder: "MD. AL AMIN SOHAG",
        branch: "Chuadanga Branch",
        discrepancyDetails: {
            transactionDate: "06-Jul-2026",
            totalDebited: 1238000.00,
            beneficiaryReceived: 238000.00,
            uncreditedSuspenseAmount: 1000000.00,
            traceId: "100NEXP26187M597",
            status: "CHARGEBACK_REQUESTED"
        }
    });
});

// Health API
router.get('/health', (req, res) => {
    res.json({ status: "UP", timestamp: new Date().toISOString() });
});

// VERY IMPORTANT: MUST EXPORT
module.exports = router;
