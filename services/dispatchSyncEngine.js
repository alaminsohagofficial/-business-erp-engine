/**
 * Dispatch Synchronization Engine
 * Module: /services/dispatchSyncEngine.js
 * Project: business-erp-engine
 * 
 * Description:
 * Coordinates inventory force-release orders and syncs approval states
 * between the SAP Reconciliation Middleware and warehouse dispatch portals.
 */

const crypto = require('crypto');

class DispatchSyncEngine {
  /**
   * Initialize engine with default dispatch centers and retry configuration.
   * @param {Object} config - Configuration parameters
   */
  constructor(config = {}) {
    this.dispatchCentres = config.dispatchCentres || ['MAIN_HUB_DHAKA', 'CENTRAL_WAREHOUSE_CTG'];
    this.maxRetries = config.maxRetries || 3;
    this.timeoutMs = config.timeoutMs || 5000;
  }

  /**
   * Generates a secure authorization token for inventory release orders.
   * @param {string} dealerId - The target dealer identifier.
   * @param {string} targetArticle - Stock SKU or article number.
   * @returns {string} HMAC SHA-256 signature string.
   */
  generateReleaseSignature(dealerId, targetArticle) {
    const secret = process.env.DISPATCH_SECRET_KEY || 'default_erp_dispatch_secret';
    const timestamp = Math.floor(Date.now() / 1000);
    const payload = `${dealerId}:${targetArticle}:${timestamp}`;
    
    return crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex');
  }

  /**
   * Evaluates override audit payload and triggers order release sync.
   * @param {Object} overrideRecord - Validated ledger override object from database/middleware.
   * @returns {Promise<Object>} Execution result containing sync status and dispatch order metadata.
   */
  async processForceRelease(overrideRecord) {
    const { dealerId, dealerName, targetArticle, dispatchCentre, totalVerifiedCreditsBDT } = overrideRecord;

    // 1. Sanity check on required properties
    if (!dealerId || !targetArticle) {
      throw new Error('Invalid override record: Missing dealerId or targetArticle.');
    }

    // 2. Determine target warehouse location
    const selectedCentre = this.dispatchCentres.includes(dispatchCentre)
      ? dispatchCentre
      : this.dispatchCentres[0];

    // 3. Construct dispatch payload
    const dispatchOrder = {
      orderId: `DISP-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      dealerId,
      dealerName,
      targetArticle,
      dispatchCentre: selectedCentre,
      clearedCreditBalanceBDT: totalVerifiedCreditsBDT,
      signature: this.generateReleaseSignature(dealerId, targetArticle),
      status: 'APPROVED_FOR_IMMEDIATE_DISPATCH',
      createdAt: new Date().toISOString()
    };

    // 4. Execute sync attempt with external inventory pipeline
    const syncSuccess = await this.syncWithWarehouse(dispatchOrder);

    if (!syncSuccess) {
      return {
        success: false,
        status: 'SYNC_FAILED_QUEUED_FOR_RETRY',
        dispatchOrder
      };
    }

    return {
      success: true,
      status: 'DISPATCH_SYNCED_SUCCESSFULLY',
      dispatchOrder
    };
  }

  /**
   * Simulates/Executes external network dispatch API sync with retry logic.
   * @param {Object} dispatchOrder - Formatted dispatch order payload.
   * @returns {Promise<boolean>} True if sync acknowledged by warehouse.
   */
  async syncWithWarehouse(dispatchOrder) {
    let attempt = 0;
    
    while (attempt < this.maxRetries) {
      attempt++;
      try {
        console.log(`[DispatchSyncEngine] Syncing order ${dispatchOrder.orderId} (Attempt ${attempt}/${this.maxRetries})...`);

        // Replace this mock timeout with actual fetch/axios call to warehouse API
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Mock success response
        console.log(`[DispatchSyncEngine] Order ${dispatchOrder.orderId} acknowledged by ${dispatchOrder.dispatchCentre}.`);
        return true;
      } catch (error) {
        console.warn(`[DispatchSyncEngine] Attempt ${attempt} failed: ${error.message}`);
        if (attempt < this.maxRetries) {
          // Exponential backoff delay
          await new Promise((resolve) => setTimeout(resolve, 1000 * Math.pow(2, attempt)));
        }
      }
    }

    return false;
  }
}

module.exports = DispatchSyncEngine;
