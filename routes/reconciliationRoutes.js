const express = require('express');
const router = express.Router();

// ==========================================
// DBBL Chargeback & Suspense Audit API
// ==========================================
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
        },
        actionRequired: "Interbank Credit Reversal to Account 7017511802593"
    });
});

// ==========================================
// Consolidated Health Check API
// ==========================================
router.get('/health', (req, res) => {
    res.json({
        status: "UP",
        service: "VatOne ERP & DBBL Reconciliation Engine",
        timestamp: new Date().toISOString()
    });
});

module.exports = router;
