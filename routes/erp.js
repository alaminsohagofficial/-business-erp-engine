const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');

// GET all ERP transactions for the dashboard
router.get('/transactions', async (req, res) => {
  try {
    const transactions = await Transaction.find().sort({ valueDate: -1 });
    res.status(200).json({ 
      success: true, 
      count: transactions.length, 
      data: transactions 
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST a new transaction or ledger override
router.post('/transactions', async (req, res) => {
  try {
    const newTransaction = new Transaction(req.body);
    const savedTransaction = await newTransaction.save();
    res.status(201).json({ success: true, data: savedTransaction });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

module.exports = router;
