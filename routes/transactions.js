const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');

/**
 * Utility Wrapper to handle async route errors cleanly 
 * without needing try-catch in every controller.
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// ==========================================
// @route   GET /api/v1/transactions
// @desc    Fetch ERP transactions (Sorted by latest date)
// @access  Public / Internal API
// ==========================================
router.get(
  '/transactions',
  asyncHandler(async (req, res) => {
    const limit = parseInt(req.query.limit, 10) || 100;
    const partner = req.query.partner;

    // Build dynamic query filter
    const query = {};
    if (partner) {
      query.partner = partner;
    }

    const transactions = await Transaction.find(query)
      .sort({ valueDate: -1, createdAt: -1 })
      .limit(limit)
      .lean();

    res.status(200).json({
      success: true,
      count: transactions.length,
      data: transactions,
    });
  })
);

// ==========================================
// @route   POST /api/v1/transactions
// @desc    Create a new transaction or ledger override
// @access  Public / Internal API
// ==========================================
router.post(
  '/transactions',
  asyncHandler(async (req, res) => {
    // Basic Payload Validation
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Bad Request',
        message: 'Transaction payload cannot be empty.',
      });
    }

    const newTransaction = new Transaction(req.body);
    const savedTransaction = await newTransaction.save();

    res.status(201).json({
      success: true,
      message: 'Transaction successfully recorded to ledger.',
      data: savedTransaction,
    });
  })
);

module.exports = router;
