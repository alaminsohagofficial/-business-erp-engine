/**
 * Central ERP Engine Server (SAIOS Connected)
 * Supported Entities: Minister-Myone Group, Butterfly Marketing Ltd, Salsabilah Amin Ltd
 */

require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/business_erp_engine';

// ==========================================
// 1. Security & Body Parser Middleware
// ==========================================
app.use(helmet({
  contentSecurityPolicy: false // Permissive CSP for dynamic ERP dashboard rendering
}));
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static assets (Dashboard UI)
app.use(express.static(path.join(__dirname, 'public')));

// ==========================================
// 2. Database Connection & Lifecycle Events
// ==========================================
mongoose.set('strictQuery', false);

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(MONGO_URI);
    console.log(`🟢 MongoDB Connected: ${conn.connection.host} / ${conn.connection.name}`);
  } catch (err) {
    console.error('🔴 MongoDB Connection Initial Error:', err.message);
  }
};

connectDB();

mongoose.connection.on('disconnected', () => {
  console.warn('⚠️ MongoDB disconnected! Attempting to reconnect...');
});

mongoose.connection.on('error', (err) => {
  console.error('🔴 MongoDB Database Error:', err.message);
});

// ==========================================
// 3. Router Imports & Mounting
// ==========================================
const apiRoutes = require('./routes');
const reconciliationRoutes = require('./services/reconciliation/routes');

// Mount API Endpoints
app.use('/api/v1', apiRoutes);
app.use('/api/v1/reconciliations', reconciliationRoutes);

// ==========================================
// 4. Base Routes & System Health Check
// ==========================================

// Serve Dashboard SPA Index
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Gateway & Health Inspection Endpoint
app.get('/health', (req, res) => {
  const dbStatusMap = {
    0: 'DISCONNECTED',
    1: 'CONNECTED',
    2: 'CONNECTING',
    3: 'DISCONNECTING'
  };

  const dbState = mongoose.connection.readyState;
  const isHealthy = dbState === 1;

  res.status(isHealthy ? 200 : 503).json({
    status: isHealthy ? 'ONLINE' : 'DEGRADED',
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

// ==========================================
// 5. Error Handling & Fallbacks
// ==========================================

// 404 Route Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint Not Found',
    path: req.originalUrl
  });
});

// Global Error Middleware
app.use((err, req, res, next) => {
  console.error('🔥 Server Error Stack:', err.stack);
  res.status(err.status || 500).json({
    success: false,
    error: err.name || 'Internal Server Error',
    message: err.message || 'An unexpected server error occurred.'
  });
});

// ==========================================
// 6. Server Initialization & Graceful Shutdown
// ==========================================
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 ERP Engine Running on Port ${PORT}`);
});

const gracefulShutdown = (signal) => {
  console.log(`\n🛑 ${signal} received. Initiating graceful shutdown...`);
  server.close(async () => {
    try {
      await mongoose.connection.close();
      console.log('⚡ MongoDB connection closed. ERP Engine safely terminated.');
      process.exit(0);
    } catch (err) {
      console.error(' Error during database disconnect:', err.message);
      process.exit(1);
    }
  });
};

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
