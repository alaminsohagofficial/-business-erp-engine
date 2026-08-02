export interface AdvanceCredit {
  date: string;
  doc_no: string;
  type: string;
  amount: number;
  status: 'PAID & POSTED' | 'POSTED' | 'PENDING' | 'REJECTED';
}

export interface CorePayment {
  date: string;
  doc_no: string;
  type: string;
  amount: number;
  remarks: string;
  status: 'POSTED_ADMITTED' | 'SETTLED' | 'PENDING';
}

export interface DealerMeta {
  dealer_id: string; // e.g., "3000002272"
  dealer_name: string; // e.g., "SR Electronics Park"
  location: string;
  national_rank?: string;
  ytd_sales_bdt?: number;
}

export interface TrueLedgerStatus {
  total_advance_settled_bdt: number;
  legacy_unlocked_balance_bdt: number;
  audit_conclusion: string;
}

export interface FinancialAccountingFI {
  gateway_source: string;
  verified_advance_credits: AdvanceCredit[];
  july_core_freedom_payments: CorePayment[];
  true_ledger_status: TrueLedgerStatus;
}

export interface SystemOverrideRules {
  enforce_portal_unblock: boolean;
  bypass_local_lock_reason: string;
  authorized_by: string;
}

export interface InventoryPipeline {
  target_article: string;
  dispatch_centre: string;
  status: string;
}

export interface SalesAndDistributionSD {
  system_override_rules: SystemOverrideRules;
  inventory_pipeline: InventoryPipeline;
}

export interface ButterflyLedgerPayload {
  dealer_meta: DealerMeta;
  financial_accounting_fi: FinancialAccountingFI;
  sales_and_distribution_sd: SalesAndDistributionSD;
}

export interface OverrideResponse {
  success: boolean;
  dealer_id: string;
  dealer_name: string;
  total_verified_credits_bdt: number;
  net_reconciled_status: string;
  unblock_status: string;
  dispatch_release: {
    article: string;
    dispatch_center: string;
    status: string;
  };
  timestamp: string;
}
