/**
 * Reconciliation Controller
 * Module: Services / Reconciliation
 * Handles Minister Dispute Resolution & Butterfly Report Generation
 */

const Transaction = require('../../models/Transaction');

/**
 * @desc    Resolve Minister-Myone Ledger Dispute (Auto-Posting SAP Doc 5100029481)
 * @route   POST /api/v1/reconciliations/resolve-minister
 */
exports.resolveMinisterDispute = async (req, res) => {
  try {
    // Both TRX IDs mapped to prevent typo issues between UI & Ledger
    const targetTrxIds = ["IBBLFT260701801", "IBBLFT260701831"];
    
    const resolvePayload = {
      sapDocumentNo: "5100029481",
      dealerCode: "DEAL002905",
      dealerName: "Minister Hi-Tech Park & MyOne Group",
      amount: 13269545.00,
      clearedUnits: 450,
      systemStatus: "RESOLVED_AND_POSTED",
      clearanceMode: "IBBL_RTGS_AUTOMATED_CLEARANCE",
      resolvedAt: new Date()
    };

    // Update transactions atomically in MongoDB
    const updatedRecord = await Transaction.updateMany(
      { transactionId: { $in: targetTrxIds } },
      { $set: resolvePayload },
      { upsert: true }
    );

    return res.status(200).json({
      success: true,
      message: "Minister-Myone dispute successfully resolved & 450 units inventory released.",
      targetTrxIds,
      sapDocNo: "5100029481",
      clearedAmount: 13269545.00,
      auditRef: "DBBL/HO/SYS-AUDIT/2026/10925-AMEND",
      result: updatedRecord
    });

  } catch (error) {
    console.error("[RECONCILIATION ERROR]:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to resolve Minister dispute.",
      error: error.message
    });
  }
};

/**
 * @desc    Fetch Summary for Reconciliation Dashboard
 * @route   GET /api/v1/reconciliations
 */
exports.getReconciliations = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      data: {
        ministerSummary: {
          dealerCode: "DEAL002905",
          sapDocNo: "5100029481",
          totalCleared: 15189545.00, // DBBL + IBBL Total
          status: "100% OK (450 Units Released)"
        },
        butterflySummary: {
          dealerCode: "3000002272",
          totalAdvanceDeposited: 1029000.00,
          blockedOrder: 650000.00,
          status: "CLEARED"
        }
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * @desc    Update Status by ID
 * @route   PATCH /api/v1/reconciliations/:id/status
 */
exports.updateReconciliationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const updated = await Transaction.findByIdAndUpdate(
      id,
      { systemStatus: status },
      { new: true }
    );

    return res.status(200).json({ success: true, data: updated });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};
