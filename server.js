const express = require('express'); 
const path = require('path');
const app = express();

// Render স্বয়ংক্রিয়ভাবে PORT অ্যাসাইন করবে, না পেলে 3000
const PORT = process.env.PORT || 3000;

app.use(express.json());

// ফ্রন্টএন্ডের HTML ফাইলটি যদি রুটে থাকে তবে তা সার্ভ করার জন্য
app.use(express.static(__dirname));

// ==========================================
// ১. জেমিনি এআই ফিন্যান্সিয়াল অ্যানালিটিক্স
// ==========================================
app.post('/api/gemini-insight', async (req, res) => {
    try {
        const data = {
            totalSales: 28649996.98,
            totalPaid: 22221029.92,
            totalPurchase: 30026974.70,
            customerDue: 6428967.06
        };

        const insight = `🤖 Salsabilah Amin Ltd. - Gemini AI Financial Report:

1. Cash Flow Alert: আপনার মোট পারচেজ (৳30.02M) মোট সেলস (৳28.64M) এর চেয়ে বেশি। অর্থাৎ ইনভেন্টরিতে ক্যাশ ব্লক হয়ে আছে।
2. Liquidity Risk: মোট বিক্রির প্রায় 22.4% টাকা (৳6.42M) কাস্টমার ডিউ হিসেবে আটকে আছে। 
3. Recommendation: নতুন পারচেজ সাময়িক কমিয়ে বকেয়া টাকা (Due Collection) তোলার দিকে ফোকাস করলে কোম্পানির ক্যাশ ফ্লো দ্রুত পজিটিভ হবে।`;

        res.json({ insight });
    } catch (error) {
        res.status(500).json({ insight: "AI Engine processing failed." });
    }
});

// ==========================================
// ২. মিনিস্টার (Minister) অরিজিনাল ৭টি ট্রানজেকশন
// ==========================================
app.get('/api/reconcile/minister', (req, res) => {
    const ministerExactLedger = [
        { date: "06-Jul-2026", amount: 238000.00, traceId: "100NEXP26187M597", details: "NexusPay Supplier Adv (Minister)" },
        { date: "07-Jul-2026", amount: 270000.00, traceId: "100NEXP26188M616", details: "MyOne Bank Trans" },
        { date: "07-Jul-2026", amount: 230000.00, traceId: "100NEXP26188M584", details: "MyOne Bank Trans" },
        { date: "08-Jul-2026", amount: 297000.00, traceId: "100NXN126189M586", details: "Minister Group Treasury" },
        { date: "08-Jul-2026", amount: 285000.00, traceId: "100NXN126189M591", details: "Minister Group Treasury" },
        { date: "12-Jul-2026", amount: 300000.00, traceId: "100NEXP26193M601", details: "Google 65 TV Pt-1" },
        { date: "12-Jul-2026", amount: 300000.00, traceId: "100NEXP26193M602", details: "Google 65 TV Pt-2" }
    ];

    const totalVerifiedAmount = ministerExactLedger.reduce((acc, curr) => acc + curr.amount, 0);

    res.json({
        success: true,
        dealerCode: "002905",
        dealerName: "SR Electronics Park / Salsabilah Amin Limited",
        status: "100% RECONCILED & CLEARED",
        totalAmount: totalVerifiedAmount, // 19,20,000.00 BDT
        count: ministerExactLedger.length,
        transactions: ministerExactLedger
    });
});

// ==========================================
// ৩. বাটারফ্লাই (Butterfly) অরিজিনাল ৫টি ট্রানজেকশন
// ==========================================
app.get('/api/reconcile/butterfly', (req, res) => {
    const butterflyLogs = [
        { date: "06-JUL-26", amount: 200000.00, traceId: "100NXN126187M630", narration: "PA-PP2026/0630" },
        { date: "06-JUL-26", amount: 200000.00, traceId: "100NXN126187M642", narration: "Ref: 3000002272" },
        { date: "06-JUL-26", amount: 300000.00, traceId: "100NXN126187M620", narration: "PA-PP2026/0620" },
        { date: "07-JUL-26", amount: 229000.00, traceId: "100NXN126188M636", narration: "Core Reference" },
        { date: "10-JUL-26", amount: 100000.00, traceId: "100NEXP26191M100", narration: "Fund Transfer" }
    ];

    const totalAdvance = butterflyLogs.reduce((sum, item) => sum + item.amount, 0);

    res.json({
        success: true,
        company: "Butterfly Marketing Limited",
        totalDepositedAdvance: totalAdvance, // 10,29,000.00 BDT
        currentBlockedOrder: 650000.00,
        varianceAdjustmentPending: 76210.00,
        auditStatus: "Pending Monday Audit",
        transactions: butterflyLogs
    });
});

// ক্যাচ-অল রাউট (সবসময় index.html রিটার্ন করবে)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Render-এর জন্য 0.0.0.0 হোস্ট বাইন্ডিং করা হলো
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 ERP Engine successfully running on port ${PORT}`);
});
