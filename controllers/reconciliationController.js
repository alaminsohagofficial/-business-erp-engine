/**
 * Reconciliation Controller (Bulletproof Version)
 * Handles DBBL/Bank Statement Ingestion, ERP Ledger Matching,
 * Amount Verification, Variance Detection, and Credit Hold Releases.
 */

exports.reconcileLedger = async (req, res) => {
  try {
    const { dealerId, bankTransactions, erpPostedEntries } = req.body;

    if (!dealerId || !Array.isArray(bankTransactions) || !Array.isArray(erpPostedEntries)) {
      return res.status(400).json({
        success: false,
        message: "Dealer ID, Bank Transactions array, and ERP Entries array are required."
      });
    }

    // 1. ERP Map creation with Duplicate ID & Amount Mismatch Detection
    const erpLookup = new Map();
    const duplicateErpIds = new Set();
    const matchedErpKeys = new Set();
    let totalErpPostedAmount = 0;

    erpPostedEntries.forEach((erp, index) => {
      const amountInPaisa = Math.round(Number(erp.amount || 0) * 100);
      totalErpPostedAmount += amountInPaisa;

      const erpRecord = { ...erp, originalIndex: index, amountInPaisa };

      // Helper to store and detect duplicate keys in ERP entries
      const setOrFlagDuplicate = (key) => {
        if (!key) return;
        if (erpLookup.has(key)) {
          duplicateErpIds.add(key);
        } else {
          erpLookup.set(key, erpRecord);
        }
      };

      if (erp.trxId) setOrFlagDuplicate(erp.trxId);
      if (erp.lid) setOrFlagDuplicate(erp.lid);
    });

    let totalBankSettledAmount = 0;
    let unpostedCredits = [];
    let verifiedTransactions = [];
    let amountMismatches = [];

    // 2. Bank Transaction Processing (O(N) Complexity)
    bankTransactions.forEach((bankTrx) => {
      if (bankTrx.status === "SUCCESS" || bankTrx.status === "SETTLED") {
        const bankAmountInPaisa = Math.round(Number(bankTrx.amount || 0) * 100);
        totalBankSettledAmount += bankAmountInPaisa;

        const lookupKey = bankTrx.trxId || bankTrx.lid;
        const matchedErpEntry = erpLookup.get(lookupKey);

        if (matchedErpEntry) {
          // Check for Strict Amount Matching
          if (matchedErpEntry.amountInPaisa === bankAmountInPaisa) {
            matchedErpKeys.add(matchedErpEntry.originalIndex);
            verifiedTransactions.push({
              trxId: bankTrx.trxId,
              lid: bankTrx.lid,
              amount: bankTrx.amount,
              status: "VERIFIED_AND_POSTED"
            });
          } else {
            // ID matches but amount differs (e.g., Bank: 1,50,000 vs ERP: 15,000)
            amountMismatches.push({
              trxId: bankTrx.trxId,
              lid: bankTrx.lid,
              bankAmount: bankTrx.amount,
              erpAmount: matchedErpEntry.amount,
              variance: (bankAmountInPaisa - matchedErpEntry.amountInPaisa) / 100,
              status: "AMOUNT_MISMATCH_SUSPECTED"
            });
          }
        } else {
          // Cleared in Bank but missing in ERP
          unpostedCredits.push({
            trxId: bankTrx.trxId,
            lid: bankTrx.lid,
            amount: bankTrx.amount,
            date: bankTrx.date,
            status: "UNPOSTED_CREDIT_STUCK"
          });
        }
      }
    });

    // 3. Unmatched ERP Entries
    const unmatchedErpEntries = erpPostedEntries.filter(
      (_, index) => !matchedErpKeys.has(index)
    );

    // 4. Calculations & Currency Conversions
    const unpostedTotalPaisa = unpostedCredits.reduce(
      (sum, item) => sum + Math.round(Number(item.amount || 0) * 100),
      0
    );

    const bankSettledFinal = totalBankSettledAmount / 100;
    const erpPostedFinal = totalErpPostedAmount / 100;
    const unpostedTotalFinal = unpostedTotalPaisa / 100;
    const varianceFinal = (totalBankSettledAmount - totalErpPostedAmount) / 100;

    const isHoldEligibleForRelease = unpostedCredits.length > 0 && amountMismatches.length === 0;

    return res.status(200).json({
      success: true,
      dealerId,
      summary: {
        totalBankSettledAmount: bankSettledFinal,
        totalErpPostedAmount: erpPostedFinal,
        unpostedTotalAmount: unpostedTotalFinal,
        variance: varianceFinal,
        trueAdvanceBalance: -Math.abs(unpostedTotalFinal),
        statusDirective: isHoldEligibleForRelease
          ? "RELEASE_CREDIT_HOLD_IMMEDIATELY"
          : amountMismatches.length > 0
          ? "FLAG_AMOUNT_MISMATCH_FOR_AUDIT"
          : "LEDGER_FULLY_ALIGNED"
      },
      auditDetails: {
        verifiedCount: verifiedTransactions.length,
        unpostedCount: unpostedCredits.length,
        mismatchCount: amountMismatches.length,
        duplicateIdCount: duplicateErpIds.size,
        duplicateErpIds: Array.from(duplicateErpIds),
        amountMismatches,
        unpostedCredits,
        verifiedTransactions,
        unmatchedErpEntries
      }
    });

  } catch (error) {
    console.error("Reconciliation Engine Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error during ledger reconciliation.",
      error: error.message
    });
  }
};
