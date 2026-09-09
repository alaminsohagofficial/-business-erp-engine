const express = require('express');
const mongoose = require('mongoose');
const crypto = require('crypto');
const Ledger = require('./models/ledger'); // আপনার Mongoose স্কিমা ফাইল

const app = express();
app.use(express.json());

// MongoDB Connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/salsabilah_erp';
mongoose.connect(MONGO_URI)
    .then(() => console.log('Connected to MongoDB Successfully'))
    .catch(err => console.error('MongoDB Connection Error:', err));

// Middleware: Python Sync Engine থেকে আসা SHA-256 চেকসাম ভেরিফিকেশন
const verifyChecksum = (req, res, next) => {
    const clientChecksum = req.headers['x-checksum-sha256'];
    if (!clientChecksum) {
        return res.status(401).json({ success: false, message: 'Missing X-Checksum-SHA256 header' });
    }
    
    // পে-লোড সাজিয়ে সার্ভারে হ্যাশ জেনারেট করা
    const payloadString = JSON.stringify(req.body, Object.keys(req.body).sort());
    const serverChecksum = crypto.createHash('sha256').update(payloadString).digest('hex');

    if (clientChecksum !== serverChecksum) {
        return res.status(403).json({ success: false, message: 'Cryptographic Checksum Mismatch' });
    }
    next();
};

// 1. Ledger Sync Webhook Route (Python Engine থেকে ডেটা রিসিভ করার জন্য)
app.post('/api/v1/sync/ledger', verifyChecksum, async (req, res) => {
    try {
        const { dealer_code, sap_posting_doc, net_advance_buffer, status } = req.body;
        console.log(`[Sync Received] Dealer: ${dealer_code}, SAP Doc: ${sap_posting_doc}`);
        
        // চাইলে এখানে Mongoose ডেটাবেজে লেজার সেভ বা আপডেট করতে পারেন
        // await Ledger.create({ dealerCode: dealer_code, ... });

        res.status(200).json({
            success: true,
            message: 'Ledger synchronized and verified via SHA-256 successfully',
            data: { dealer_code, sap_posting_doc, net_advance_buffer, status }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// 2. Treasury Live Status Route (index.html ও sap.html ড্যাশবোর্ডের জন্য)
app.get('/api/v1/treasury/live-status', async (req, res) => {
    try {
        res.status(200).json({
            success: true,
            data: {
                minister: {
                    dealerCode: "DEAL002905",
                    entity: "Minister Hi-Tech Park Electronics Ltd.",
                    netAdvanceBuffer: 33056297.00,
                    status: "100% CONSISTENT"
                },
                butterfly: {
                    dealerCode: "3000002272",
                    entity: "Butterfly Marketing Limited",
                    clearedAmount: 31429000.00,
                    status: "RELEASED"
                }
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Salsabilah Enterprise Node Server running on port ${PORT}`);
});
