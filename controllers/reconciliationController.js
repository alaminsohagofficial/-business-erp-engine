/**
 * Reconciliation Controller
 * Handles DBBL/Bank Statement Ingestion, ERP Ledger Matching,
 * Variance Detection, and True Advance Balance Calculation.
 */

// ব্যাংক স্টেটমেন্ট ও ইআরপি লেজার রিকনসিল করার মেইন ফাংশন
exports.reconcileLedger = async (req, res) => {
  try {
    const { dealerId, bankTransactions, erpPostedEntries } = req.body;

    if (!dealerId || !bankTransactions || !erpPostedEntries) {
      return res.status(400).json({
        success: false,
        message: "Dealer ID, Bank Transactions, and ERP Entries are required."
      });
    }

    let totalBankSettledAmount = 0;
    let totalErpPostedAmount = 0;
    let unpostedCredits = [];
    let verifiedTransactions = [];

    // ১. ব্যাংকের সফল ট্রানজেকশনগুলো ফিল্টার ও প্রসেস করা
    bankTransactions.forEach((bankTrx) => {
      if (bankTrx.status === "SUCCESS" || bankTrx.status === "SETTLED") {
        totalBankSettledAmount += Number(bankTrx.amount);

        // ইআরপি রিকার্ডের সাথে ট্রানজেকশন আইডি বা SAP LID মেলানো
        const matchedErpEntry = erpPostedEntries.find(
          (erp) => erp.trxId === bankTrx.trxId || erp.lid === bankTrx.lid
        );

        if (matchedErpEntry) {
          verifiedTransactions.push({
            trxId: bankTrx.trxId,
            lid: bankTrx.lid,
            amount: bankTrx.amount,
            status: "VERIFIED_AND_POSTED"
          });
        } else {
          // ব্যাংকে টাকা ক্লিয়ার কিন্তু ইআরপিতে পোস্ট হয়নি (Unposted Credit)
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

    // ২. ইআরপিতে ইতিমধ্যে পোস্ট হওয়া মোট অ্যামাউন্ট হিসাব
    erpPostedEntries.forEach((erp) => {
      totalErpPostedAmount += Number(erp.amount);
    });

    // ৩. ভ্যারিয়েন্স এবং ট্রু অ্যাডভান্স (True Advance Balance) হিসাব
    const unpostedTotalAmount = unpostedCredits.reduce(
      (sum, item) => sum + Number(item.amount),
      0
    );
    const variance = totalBankSettledAmount - totalErpPostedAmount;

    // যদি ব্যাংক থেকে ক্লিয়ার হওয়া মোট টাকা ইআরপির চেয়ে বেশি হয়, তবে ডিলারের অ্যাডভান্স জমা আছে
    const trueAdvanceBalance = unpostedTotalAmount;
    const isHoldEligibleForRelease = unpostedCredits.length > 0;

    return res.status(200).json({
      success: true,
      dealerId,
      summary: {
        totalBankSettledAmount,
        totalErpPostedAmount,
        unpostedTotalAmount,
        variance,
        trueAdvanceBalance: -Math.abs(trueAdvanceBalance), // Represented as negative credit position
        statusDirective: isHoldEligibleForRelease
          ? "RELEASE_CREDIT_HOLD_IMMEDIATELY"
          : "LEDGER_FULLY_ALIGNED"
      },
      auditDetails: {
        verifiedCount: verifiedTransactions.length,
        unpostedCount: unpostedCredits.length,
        unpostedCredits,
        verifiedTransactions
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
