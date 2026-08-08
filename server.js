const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// MySQL Database Pool Configuration
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'business_erp',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// ১. ডিলার ব্যাকগ্রাউন্ড ও রিয়েল-টাইম লেজার ফেস করা
app.get('/api/v1/ledger/:dealerId', async (req, res) => {
    try {
        const { dealerId } = req.params;
        const [dealer] = await pool.execute('SELECT * FROM dealers WHERE dealer_id = ?', [dealerId]);
        const [ledger] = await pool.execute('SELECT * FROM dealer_ledger WHERE dealer_id = ? ORDER BY posted_at DESC', [dealerId]);
        res.json({ success: true, dealer: dealer[0], ledger });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// ২. রিয়েল-টাইম পেমেন্ট ও লেজার অটো-আপডেট
app.post('/api/v1/payments/settle', async (req, res) => {
    const { dealerId, amount, utrRef, bankAccount, routingNo, paymentChannel } = req.body;
    const conn = await pool.getConnection();
    try {
        await conn.beginTransaction();

        const txnId = `TXN-${Date.now()}`;
        await conn.execute(
            `INSERT INTO bank_transactions (transaction_id, dealer_id, amount, transaction_type, payment_channel, bank_account_no, routing_no, utr_ref_no, status) 
             VALUES (?, ?, ?, 'PAYMENT_IN', ?, ?, ?, ?, 'SETTLED')`,
            [txnId, dealerId, amount, paymentChannel, bankAccount, routingNo, utrRef]
        );

        const [dealerRows] = await conn.execute(`SELECT current_balance FROM dealers WHERE dealer_id = ? FOR UPDATE`, [dealerId]);
        const newBalance = parseFloat(dealerRows[0].current_balance) + parseFloat(amount);

        await conn.execute(
            `INSERT INTO dealer_ledger (dealer_id, transaction_id, credit, balance, description) VALUES (?, ?, ?, ?, ?)`,
            [dealerId, txnId, amount, newBalance, `Real-time payment via ${paymentChannel} (UTR: ${utrRef})`]
        );

        await conn.execute(`UPDATE dealers SET current_balance = ? WHERE dealer_id = ?`, [newBalance, dealerId]);

        await conn.commit();
        res.json({ success: true, message: "Payment processed & Ledger updated in real time", newBalance });
    } catch (err) {
        await conn.rollback();
        res.status(500).json({ success: false, error: err.message });
    } finally {
        conn.release();
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`ERP Engine Server running on port ${PORT}`));
