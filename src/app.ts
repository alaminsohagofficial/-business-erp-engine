import express, { Application, Request, Response } from 'express';
import { processLedgerOverrideHandler } from './controllers/ledgerController';

const app: Application = express();
const PORT = process.env.PORT || 3000;

// Body Parser Middleware
app.use(express.json());

// Health Check Endpoint
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'UP', service: 'VatOne ERP Engine Middleware' });
});

// API Routes
app.post('/api/v1/ledger/override', processLedgerOverrideHandler);

// Fallback Route
app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: 'Route Not Found' });
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`VatOne ERP Engine running on port ${PORT}`);
  });
}

export default app;
