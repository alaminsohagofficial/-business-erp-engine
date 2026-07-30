const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 10000;

// Middleware
app.use(cors());
app.use(express.json());

// Database Connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/erp_engine';
mongoose.connect(MONGO_URI)
  .then(() => console.log('MongoDB Connected Successfully'))
  .catch(err => console.log('MongoDB Connection Notice:', err.message));

// Health Check Route
app.get('/', (req, res) => {
  res.json({
    status: 'ONLINE',
    engine: 'Salsabilah Electronics & Business ERP Engine',
    partners: ['Minister Hi-Tech Park', 'Butterfly Marketing Limited', 'Dutch-Bangla Bank', 'Sonali Bank'],
    timestamp: new Date()
  });
});

// API Routes
const erpRoutes = require('./routes/erp');
app.use('/api/erp', erpRoutes);

// Server Start
app.listen(PORT, () => {
  console.log(`ERP Engine is running on port ${PORT}`);
});
