const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');

// ১. লেজার সামারি ও মোট ব্যালেন্স চেক
router.get('/ledger-summary', async (req, res) => {
  try {
    const transactions = await Transaction.find().sort({ valueDate: -1 });
    const totalAmount = transactions.reduce((acc, item) => acc + item.amount, 0);
    
    res.json({
      success: true,
      totalTransactions: transactions.length,
      aggregateTotal: totalAmount,
      data: transactions
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ২. নতুন ট্রানজ্যাকশন বা ব্যাংক লোগ এন্ট্রি
router.post('/add-transaction', async (req, res) => {
  try {
    const trx = new Transaction(req.body);
    const savedTrx = await trx.save();
    res.status(201).json({ success: true, data: savedTrx });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// ৩. পেমেন্ট ডিসপিউট ট্র্যাক
router.get('/disputes', async (req, res) => {
  try {
    const disputes = await Transaction.find({ status: 'DISPUTED' });
    res.json({ success: true, count: disputes.length, disputes });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
