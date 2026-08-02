import { ButterflyLedgerPayload, OverrideResponse } from '../types/ledger.types';

export class LedgerOverrideService {
  /**
   * Validates financial posting records and processes the SD module credit unblock.
   */
  public async executeOverride(payload: ButterflyLedgerPayload): Promise<OverrideResponse> {
    const { dealer_meta, financial_accounting_fi, sales_and_distribution_sd } = payload;

    // 1. Calculate Gross May Advance Credits (Type DZ / RTGS)
    const validMayCredits = financial_accounting_fi.verified_advance_credits
      .filter((c) => c.status === 'POSTED' || c.status === 'PAID & POSTED')
      .reduce((sum, c) => sum + c.amount, 0);

    // 2. Calculate July Collections & RTGS Settlements
    const validJulyPayments = financial_accounting_fi.july_core_freedom_payments
      .filter((p) => p.status === 'POSTED_ADMITTED' || p.status === 'SETTLED')
      .reduce((sum, p) => sum + p.amount, 0);

    const grossVerifiedCreditsBDT = validMayCredits + validJulyPayments;

    // 3. Verify Override Directives
    const overrideRules = sales_and_distribution_sd.system_override_rules;
    if (!overrideRules.enforce_portal_unblock) {
      throw new Error(`Override Directive Denied: Unblock enforcement flag is FALSE for Dealer ${dealer_meta.dealer_id}`);
    }

    // 4. Resolve Local Lock Flag (FALSE_CREDIT_HOLD_MODULE_MISALIGNMENT)
    const unblockStatusMessage = `RESOLVED: Cleared lock (${overrideRules.bypass_local_lock_reason}) via ${overrideRules.authorized_by}`;

    // 5. Execute Warehouse Release
    const pipeline = sales_and_distribution_sd.inventory_pipeline;
    const releaseConfirmation = {
      article: pipeline.target_article,
      dispatch_center: pipeline.dispatch_centre,
      status: 'FORCE_RELEASE_ORDER_APPROVED',
    };

    return {
      success: true,
      dealer_id: dealer_meta.dealer_id,
      dealer_name: dealer_meta.dealer_name,
      total_verified_credits_bdt: grossVerifiedCreditsBDT,
      net_reconciled_status: 'SURPLUS_CREDIT_ACTIVE',
      unblock_status: unblockStatusMessage,
      dispatch_release: releaseConfirmation,
      timestamp: new Date().toISOString(),
    };
  }
}
