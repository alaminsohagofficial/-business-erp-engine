/**
 * Central ERP Engine Server (SAIOS Connected)
 * Companies: Minister-Myone, Butterfly, Salsabilah Amin Ltd
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 5000;

// Security & Middleware Setup
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Mongo Database Connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/business_erp_engine';

mongoose.connect(MONGO_URI)
  .then(() => console.log('🟢 MongoDB Connected: ERP Engine Ledger Database'))
  .catch((err) => console.error('🔴 MongoDB Connection Error:', err.message));

// Route Imports
const reconciliationRoutes = require('./services/reconciliation/routes');
const stockRoutes = require('./services/inventory/routes');

// Mount Routes to API Endpoints
app.use('/api/v1/reconciliation', reconciliationRoutes);
app.use('/api/v1/inventory', stockRoutes);

// Health Check / SAIOS Gateway Verification
app.get('/health', (req, res) => {
  const dbStatusMap = {
    0: 'DISCONNECTED',
    1: 'CONNECTED',
    2: 'CONNECTING',
    3: 'DISCONNECTING'
  };

  const dbState = mongoose.connection.readyState;

  res.status(dbState === 1 ? 200 : 503).json({
    status: dbState === 1 ? 'ONLINE' : 'DEGRADED',
    database: dbStatusMap[dbState] || 'UNKNOWN',
    system: 'Salsabilah Business ERP Engine',
    timestamp: new Date().toISOString(),
    supportedEntities: [
      'Minister-Myone Group',
      'Butterfly Marketing Ltd',
      'Salsabilah Amin Ltd'
    ]
  });
});

// 404 Route Handler
app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Endpoint Not Found' });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('🔥 Server Error Stack:', err.stack);
  res.status(err.status || 500).json({
    success: false,
    error: err.name || 'Internal Server Error',
    message: err.message
  });
});

// Start Server Engine with Host Binding for Cloud
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 ERP Engine Running on Port ${PORT}`);
});

// Graceful Shutdown Handler
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutdown signal received. Closing HTTP server & Database connection...');
  server.close(async () => {
    await mongoose.connection.close();
    console.log('⚡ ERP Engine gracefully terminated.');
    process.exit(0);
  });
});
