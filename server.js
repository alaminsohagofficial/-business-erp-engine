const express = require('express');
const path = require('path');
const app = express();

const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(__dirname));

// ==========================================
// ১. মিনিস্টার (Minister MyOne Group) - SAP LID ম্যাপিং সহ API
// ==========================================
app.get('/api/reconcile/minister', (req, res) => {
    const ministerLidLedger = [
        { date: "06-Jul-2026", traceId: "100NEXP26187M597", lid: "LID01976788453", amount: 238000.00, status: "SETTLED" },
        { date: "07-Jul-2026", traceId: "100NEXP26188M616", lid: "LID01996890123", amount: 270000.00, status: "SETTLED" },
        { date: "07-Jul-2026", traceId: "100NEXP26188M584", lid: "LID01996889539", amount: 230000.00, status: "SETTLED" },
        { date: "08-Jul-2026", traceId: "100NXN126189M586", lid: "LID01998640246", amount: 297000.00, status: "SETTLED" },
        { date: "08-Jul-2026", traceId: "100NXN126189M591", lid: "LID01938788435", amount: 285000.00, status: "SETTLED" },
        { date: "12-Jul-2026", traceId: "100NEXP26193M601", lid: "LID01996914258", amount: 300000.00, status: "SETTLED" },
        { date: "12-Jul-2026", traceId: "100NEXP26193M602", lid: "LID01996987412", amount: 300000.00, status: "SETTLED" }
    ];

    const totalMinister = ministerLidLedger.reduce((sum, item) => sum + item.amount, 0);

    res.json({
        success: true,
        dealerCode: "DEAL002905",
        dealerName: "SR Electronics Park / Salsabilah Amin Limited",
        verificationRef: "DBBL/HO/SYS-AUDIT/2026/10924",
        totalReconciledAmount: totalMinister, // BDT 1,920,000.00
        status: "100% OK / SETTLED",
        transactions: ministerLidLedger
    });
});

// ==========================================
// ২. বাটারফ্লাই (Butterfly Marketing Ltd) - Narration & Ref সহ API
// ==========================================
app.get('/api/reconcile/butterfly', (req, res) => {
    const butterflyLedger = [
        { date: "06-JUL-26", traceId: "100NXN126187M630", narration: "PA-PP2026/0630", amount: 200000.00 },
        { date: "06-JUL-26", traceId: "100NXN126187M642", narration: "Ref: 3000002272", amount: 200000.00 },
        { date: "06-JUL-26", traceId: "100NXN126187M620", narration: "PA-PP2026/0620", amount: 300000.00 },
        { date: "07-JUL-26", traceId: "100NXN126188M636", narration: "Core Reference", amount: 229000.00 },
        { date: "10-JUL-26", traceId: "100NEXP26191M100", narration: "Fund Transfer", amount: 100000.00 }
    ];

    const totalButterfly = butterflyLedger.reduce((sum, item) => sum + item.amount, 0);

    res.json({
        success: true,
        company: "Butterfly Marketing Limited",
        dealerCode: "3000002272",
        totalDepositedAdvance: totalButterfly, // BDT 1,029,000.00
        currentBlockedOrder: 650000.00,
        varianceAdjustment: 76210.00,
        transactions: butterflyLedger
    });
});

// Root Page Serving
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Engine running on port ${PORT}`);
});
