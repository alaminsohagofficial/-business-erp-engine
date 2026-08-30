import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables (.env)
dotenv.config();

// Import the dispatch sync engine from services
const { runEngine, dealerPayload } = require('../services/dispatchSyncEngine');

const app = express();
const PORT = process.env.PORT || 8080;

// Global Middleware
app.use(cors());
app.use(express.json());

// Health check route
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'UP', timestamp: new Date().toISOString() });
});

/**
 * Route: POST /api/dispatch
 * Description: Triggers real-time email, SMS, and portal reconciliation broadcast
 */
app.post('/api/dispatch', async (req: Request, res: Response) => {
  try {
    console.log(`[DISPATCH TRIGGERED] Executing notification broadcast for Dealer: ${dealerPayload.dealerCode}`);
    
    // Execute the async dispatch engine
    await runEngine();

    return res.status(200).json({
      success: true,
      message: 'Dispatch and reconciliation broadcast executed successfully.',
      data: {
        dealerCode: dealerPayload.dealerCode,
        businessName: dealerPayload.businessName,
        recipientMobile: dealerPayload.mobile,
        recipientEmail: dealerPayload.email,
        manifestId: dealerPayload.logistics.manifestId,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error: any) {
    console.error(`[DISPATCH ERROR]: ${error.message}`);
    return res.status(500).json({
      success: false,
      error: 'Failed to complete multi-channel dispatch broadcast.',
      details: error.message
    });
  }
});

// Start listening
app.listen(PORT, () => {
  console.log(`==================================================`);
  console.log(`🚀 Business ERP Engine running on port: ${PORT}`);
  console.log(`📡 Dispatch API: POST http://localhost:${PORT}/api/dispatch`);
  console.log(`==================================================`);
});

export default app;
