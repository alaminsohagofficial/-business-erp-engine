/**
 * Reconciliation Controller (Optimized Version)
 * Handles DBBL/Bank Statement Ingestion, ERP Ledger Matching,
 * Variance Detection, and True Advance Balance Calculation.
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

    // ১. পারফরম্যান্স অপটিমাইজেশনের জন্য ERP Entries-এর Fast Lookup Map ও Set তৈরি
    const erpLookup = new Map();
    const matchedErpKeys = new Set();
    let totalErpPostedAmount = 0;

    erpPostedEntries.forEach((erp, index) => {
      const amount = Math.round(Number(erp.amount || 0) * 100); // সেন্ট/পয়সায় কনভার্ট
      totalErpPostedAmount += amount;

      const erpRecord = { ...erp, originalIndex: index };
      if (erp.trxId) erpLookup.set(erp.trxId, erpRecord);
      if (erp.lid) erpLookup.set(erp.lid, erpRecord);
    });

    let totalBankSettledAmount = 0;
    let unpostedCredits = [];
    let verifiedTransactions = [];

    // ২. ব্যাংক ট্রানজেকশন প্রসেস (O(N) Complexity)
    bankTransactions.forEach((bankTrx) => {
      if (bankTrx.status === "SUCCESS" || bankTrx.status === "SETTLED") {
        const bankAmount = Math.round(Number(bankTrx.amount || 0) * 100);
        totalBankSettledAmount += bankAmount;

        // O(1) Time-এ ERP Record ম্যাচ করা
        const matchedErpEntry = erpLookup.get(bankTrx.trxId) || erpLookup.get(bankTrx.lid);

        if (matchedErpEntry) {
          matchedErpKeys.add(matchedErpEntry.originalIndex);
          verifiedTransactions.push({
            trxId: bankTrx.trxId,
            lid: bankTrx.lid,
            amount: bankTrx.amount,
            status: "VERIFIED_AND_POSTED"
          });
        } else {
          // ব্যাংকে ক্লিয়ার কিন্তু ERP-তে পোস্ট হয়নি
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

    // ৩. যেসব ERP এন্ট্রি ব্যাংকে পাওয়া যায়নি (Unmatched ERP Entries)
    const unmatchedErpEntries = erpPostedEntries.filter(
      (_, index) => !matchedErpKeys.has(index)
    );

    // ৪. ফাইনাল অ্যামাউন্টগুলো আসল কারেন্সিতে (Taka/Dollar) রূপান্তর
    const unpostedTotalAmount = unpostedCredits.reduce(
      (sum, item) => sum + Math.round(Number(item.amount || 0) * 100),
      0
    );

    const bankSettledFinal = totalBankSettledAmount / 100;
    const erpPostedFinal = totalErpPostedAmount / 100;
    const unpostedTotalFinal = unpostedTotalAmount / 100;
    const varianceFinal = (totalBankSettledAmount - totalErpPostedAmount) / 100;

    const isHoldEligibleForRelease = unpostedCredits.length > 0;

    return res.status(200).json({
      success: true,
      dealerId,
      summary: {
        totalBankSettledAmount: bankSettledFinal,
        totalErpPostedAmount: erpPostedFinal,
        unpostedTotalAmount: unpostedTotalFinal,
        variance: varianceFinal,
        trueAdvanceBalance: -Math.abs(unpostedTotalFinal), // Credit position
        statusDirective: isHoldEligibleForRelease
          ? "RELEASE_CREDIT_HOLD_IMMEDIATELY"
          : "LEDGER_FULLY_ALIGNED"
      },
      auditDetails: {
        verifiedCount: verifiedTransactions.length,
        unpostedCount: unpostedCredits.length,
        unmatchedErpCount: unmatchedErpEntries.length,
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
