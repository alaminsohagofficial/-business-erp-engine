const butterflyLedgerUpdate = {
  "dealer_meta": {
    "dealer_id": "3000002272",
    "dealer_name": "SR Electronics Park",
    "location": "Hatboalia Bazar, Chuadanga",
    "national_rank": "RANK_01_NATIONAL_LEADER",
    "ytd_sales_bdt": 81300000.00
  },

  "financial_accounting_fi": {
    "gateway_source": "DBBL_RTGS_NEXUSPAY",
    "verified_advance_credits": [
      { "date": "16-May-2026", "doc_no": "CITYRTGS69545663BD", "type": "DZ", "amount": 2000000.00, "status": "POSTED" },
      { "date": "16-May-2026", "doc_no": "CITYRTGS14445505BD", "type": "DZ", "amount": 2000000.00, "status": "POSTED" },
      { "date": "16-May-2026", "doc_no": "CITYRTGS77889911BD", "type": "DZ", "amount": 7000000.00, "status": "POSTED" },
      { "date": "16-May-2026", "doc_no": "CITYRTGS99887766BD", "type": "DZ", "amount": 9000000.00, "status": "POSTED" }
    ],
    "july_core_freedom_payments": [
      { "date": "06-Jul-2026", "doc_no": "1400007022", "type": "DZ", "amount": 200000.00, "remarks": "Collection DBBL 29692", "status": "POSTED_ADMITTED" },
      { "date": "07-Jul-2026", "doc_no": "1400008835", "type": "DZ", "amount": 300000.00, "remarks": "Collection DBBL 29699", "status": "POSTED_ADMITTED" }
    ],
    "true_ledger_status": {
      "total_advance_settled_bdt": 19433575.00,
      "legacy_unlocked_balance_bdt": 76210.00,
      "audit_conclusion": "Central FI accounts are 100% active. July entries formally validate dealer master contract durability."
    }
  },

  "sales_and_distribution_sd": {
    "system_override_rules": {
      "enforce_portal_unblock": true,
      "bypass_local_lock_reason": "FALSE_CREDIT_HOLD_MODULE_MISALIGNMENT",
      "authorized_by": "VatOne_Automated_Audit_Middleware"
    },
    "inventory_pipeline": {
      "target_article": "62 BT FD 630 WODGD Shining Gray",
      "dispatch_centre": "JSB Jessore",
      "status": "FORCE_RELEASE_ORDER_APPROVED"
    }
  }
};

export default butterflyLedgerUpdate;
