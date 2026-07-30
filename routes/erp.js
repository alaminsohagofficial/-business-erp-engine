const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');

// ১. লেজার সামারি ও মোট ব্যালেন্স চেক
router.get('/ledger-summary', async (req, res) => {
  try {
    const transactions = await Transaction.find().sort({ valueDate: -1 });
    const totalAmount = transactions.reduce((acc, item) => acc + item.amount, 0);
    res.json({ success: true, totalTransactions: transactions.length, aggregateTotal: totalAmount, data: transactions });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ২. পেমেন্ট ডিসপিউট ট্র্যাক
router.get('/disputes', async (req, res) => {
  try {
    const disputes = await Transaction.find({ status: 'DISPUTED' });
    res.json({ success: true, count: disputes.length, disputes });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ৩. নতুন ট্রানজ্যাকশন এন্ট্রি
router.post('/add-transaction', async (req, res) => {
  try {
    const trx = new Transaction(req.body);
    const savedTrx = await trx.save();
    res.status(201).json({ success: true, data: savedTrx });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// ৪. অটোমেটেড ডাটা সিডিং (১-ক্লিকে সব ডাটা আপলোড)
router.get('/seed', async (req, res) => {
  try {
    const seedData = [
      // ১. Minister-Myone Dispute (১,৩২,৬৯,৫৪৫ টাকা)
      {
        dealerId: 'DEAL002905', dealerName: 'S.R ELECTRONICS PARK', companyName: 'MINISTER_MYONE',
        bankName: 'Islami Bank PLC to DBBL', transactionType: 'Fund_Transfer', coreTrxId: 'IBBLFT260701831',
        valueDate: new Date('2026-07-01'), amount: 13269545, status: 'DISPUTED',
        narration: 'PAYMENT FOR GOODS (450 UNITS)'
      },
      // ২. Butterfly NexusPay (১,৫০,০০০ টাকা)
      {
        dealerId: '3000002272', dealerName: 'SR ELECTRONICS PARK', companyName: 'BUTTERFLY_MARKETING',
        bankName: 'Dutch-Bangla Bank PLC', transactionType: 'NexusPay', coreTrxId: 'LID02207261502',
        valueDate: new Date('2026-07-26'), amount: 150000, status: 'SUCCESS',
        narration: 'NexusPay- Butterfly Vendor Pay'
      },
      // ৩. Butterfly RTGS 1 (২০,০০,০০০ টাকা)
      {
        dealerId: '3000002272', dealerName: 'SR ELECTRONICS PARK', companyName: 'BUTTERFLY_MARKETING',
        bankName: 'City Bank to DBBL', transactionType: 'RTGS', coreTrxId: 'CITYRTGS69545663BD',
        valueDate: new Date('2026-05-16'), amount: 2000000, status: 'PAID_AND_POSTED',
        narration: 'RTGS Fund Transfer Received'
      },
      // ৪. Butterfly RTGS 2 (২০,০০,০০০ টাকা)
      {
        dealerId: '3000002272', dealerName: 'SR ELECTRONICS PARK', companyName: 'BUTTERFLY_MARKETING',
        bankName: 'City Bank to DBBL', transactionType: 'RTGS', coreTrxId: 'CITYRTGS14445505BD',
        valueDate: new Date('2026-05-16'), amount: 2000000, status: 'PAID_AND_POSTED',
        narration: 'Additional RTGS Fund Transfer'
      },
      // ৫. Butterfly RTGS 3 (৭০,০০,০০০ টাকা)
      {
        dealerId: '3000002272', dealerName: 'SR ELECTRONICS PARK', companyName: 'BUTTERFLY_MARKETING',
        bankName: 'City Bank to DBBL', transactionType: 'RTGS', coreTrxId: 'CITYRTGS77889911BD',
        valueDate: new Date('2026-05-16'), amount: 7000000, status: 'PAID_AND_POSTED',
        narration: 'Additional RTGS Fund Transfer (+7M)'
      },
      // ৬. Butterfly RTGS 4 (৯০,০০,০০০ টাকা)
      {
        dealerId: '3000002272', dealerName: 'SR ELECTRONICS PARK', companyName: 'BUTTERFLY_MARKETING',
        bankName: 'City Bank to DBBL', transactionType: 'RTGS', coreTrxId: 'CITYRTGS99887766BD',
        valueDate: new Date('2026-05-16'), amount: 9000000, status: 'PAID_AND_POSTED',
        narration: 'Additional RTGS Fund Transfer (+9M)'
      },
      // ৭. Sonali Bank Transfer (৩,০০,০০০ টাকা)
      {
        dealerId: '3107053000068', dealerName: 'S. R ELECTRONIC PARK(CC)', companyName: 'SONALI_BANK_CSS',
        bankName: 'Sonali Bank PLC', transactionType: 'Fund_Transfer', coreTrxId: 'SBP/HTB/FT/2026/07-31070',
        valueDate: new Date('2026-07-29'), amount: 300000, status: 'SUCCESS',
        narration: 'Fund Transfer to CSS NGO'
      }
    ];

    // ডাটাবেজ ক্লিয়ার করে নতুন করে সব ডাটা ইনসার্ট করা
    await Transaction.deleteMany({});
    const inserted = await Transaction.insertMany(seedData);

    res.json({ success: true, message: "Database Seeded Successfully! Ready for Audit.", recordsAdded: inserted.length });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
