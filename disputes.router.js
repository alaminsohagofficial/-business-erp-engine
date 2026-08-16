const express = require('express');
const router = express.Router();

/**
 * @route GET /reconciliation/disputes
 * @desc List and Filter Financial Disputes
 */
router.get('/', async (req, res) => {
  const { dealer_id, status = 'OPEN', limit = 50, offset = 0 } = req.query;
  
  try {
    let query = `
      SELECT dispute_id, batch_id, dbbl_trace_id, dealer_id, amount_bdt, status, created_at 
      FROM reconciliation_disputes 
      WHERE status = $1
    `;
    const params = [status];

    if (dealer_id) {
      query += ` AND dealer_id = $2`;
      params.push(dealer_id);
    }

    query += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(parseInt(limit, 10), parseInt(offset, 10));

    // Execute query using your db pool (e.g., pg pool)
    // const { rows } = await db.query(query, params);

    res.status(200).json({
      total_count: 1,
      limit: parseInt(limit, 10),
      offset: parseInt(offset, 10),
      records: [
        {
          dispute_id: "DSP-2026-0912",
          batch_id: "EFT-20260808-88392",
          dbbl_trace_id: "TRC-881023",
          dealer_id: dealer_id || "DLR-99401",
          amount_bdt: 450000.00,
          status: status,
          created_at: new Date().toISOString()
        }
      ]
    });
  } catch (error) {
    res.status(500).json({
      code: "INTERNAL_SERVER_ERROR",
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * @route GET /reconciliation/disputes/:dispute_id
 * @desc Get Dispute Detail by ID
 */
router.get('/:dispute_id', async (req, res) => {
  const { dispute_id } = req.params;

  try {
    // const { rows } = await db.query('SELECT * FROM reconciliation_disputes WHERE dispute_id = $1', [dispute_id]);
    // if (rows.length === 0) return res.status(404).json({ code: 'NOT_FOUND', message: 'Dispute not found' });

    res.status(200).json({
      dispute_id: dispute_id,
      batch_id: "EFT-20260808-88392",
      dbbl_trace_id: "TRC-881023",
      dealer_id: "DLR-99401",
      dealer_name: "Butterfly Electronics Ltd.",
      amount_bdt: 450000.00,
      status: "OPEN",
      audit_tone: "FORMAL",
      ai_notice_ref: "AUD-GEM-2026-0441",
      ai_analysis_summary: "Transaction trace #TRC-881023 missing SAP LID posting due to account number mismatch in EFT remarks field.",
      sap_lid_reference: null,
      resolution_notes: null,
      created_at: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      code: "INTERNAL_SERVER_ERROR",
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * @route PATCH /reconciliation/disputes/:dispute_id
 * @desc Resolve or Update Dispute Status
 */
router.patch('/:dispute_id', async (req, res) => {
  const { dispute_id } = req.params;
  const { status, resolution_notes, sap_lid_reference } = req.body;

  if (!['RESOLVED', 'CLOSED'].includes(status)) {
    return res.status(400).json({
      code: "VALIDATION_ERROR",
      message: "Invalid status value. Must be 'RESOLVED' or 'CLOSED'.",
      timestamp: new Date().toISOString()
    });
  }

  try {
    // const updateQuery = `
    //   UPDATE reconciliation_disputes 
    //   SET status = $1, resolution_notes = $2, sap_lid_reference = $3, updated_at = CURRENT_TIMESTAMP 
    //   WHERE dispute_id = $4 RETURNING *
    // `;
    // const { rows } = await db.query(updateQuery, [status, resolution_notes, sap_lid_reference, dispute_id]);

    res.status(200).json({
      dispute_id: dispute_id,
      status: status,
      sap_lid_reference: sap_lid_reference || "10029348",
      resolution_notes: resolution_notes,
      updated_at: new Date().toISOString(),
      message: "Dispute successfully updated and SAP ledger sync triggered."
    });
  } catch (error) {
    res.status(500).json({
      code: "INTERNAL_SERVER_ERROR",
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;
