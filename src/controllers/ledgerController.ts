import { Request, Response } from 'express';
import { LedgerOverrideService } from '../services/ledgerOverrideService';
import { ButterflyLedgerPayload } from '../types/ledger.types';

const overrideService = new LedgerOverrideService();

export const processLedgerOverrideHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const payload: ButterflyLedgerPayload = req.body;

    // Validate Required Root Keys
    if (!payload.dealer_meta || !payload.financial_accounting_fi || !payload.sales_and_distribution_sd) {
      res.status(400).json({
        error: 'Invalid Payload',
        message: 'Missing required sections: dealer_meta, financial_accounting_fi, or sales_and_distribution_sd.',
      });
      return;
    }

    // Execute Service Logic
    const result = await overrideService.executeOverride(payload);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(500).json({
      error: 'Override Processing Error',
      message: error.message || 'An internal error occurred during ledger reconciliation.',
    });
  }
};
