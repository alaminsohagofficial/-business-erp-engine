/**
 * Central ERP Engine Server (SAIOS Connected)
 * Companies: Minister-Myone, Butterfly, Salsabilah Amin Ltd
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware Setup
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Mongo Database Connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/business_erp_engine';
mongoose.connect(MONGO_URI)
  .then(() => console.log('🟢 MongoDB Connected: ERP Engine Ledger Database'))
  .catch((err) => console.error('🔴 MongoDB Connection Error:', err));

// Route Import Engine
const reconciliationRoutes = require('./services/reconciliation/routes');
const stockRoutes = require('./services/inventory/routes');

// Mount Routes to API Endpoints
app.use('/api/v1/reconciliation', reconciliationRoutes);
app.use('/api/v1/inventory', stockRoutes);

// Health Check / SAIOS Gateway Verification
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ONLINE',
    system: 'Salsabilah Business ERP Engine',
    timestamp: new Date().toISOString(),
    supportedEntities: ['Minister-Myone Group', 'Butterfly Marketing Ltd', 'Salsabilah Amin Ltd']
  });
});

// Start Server Engine
app.listen(PORT, () => {
  console.log(`🚀 ERP Engine Running on Port ${PORT}`);
});
