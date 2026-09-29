/**
 * Application Settings Configuration
 * File: config/settings.js
 */

require('dotenv').config();

const settings = {
  // Server Port Configuration
  PORT: process.env.PORT || 3000,
  NODE_ENV: process.env.NODE_ENV || 'development',

  // Database Connection
  MONGO_URI: process.env.MONGO_URI || 'mongodb://localhost:27017/vatone_erp',

  // Security Secrets
  DISPATCH_SECRET_KEY: process.env.DISPATCH_SECRET_KEY || 'salsabilah_erp_dispatch_secret_2026',

  // Google Gemini API Configuration
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',

  // DBBL Integration Mock Settings
  DBBL_API_ENDPOINT: process.env.DBBL_API_ENDPOINT || 'https://api.dbbl.com/v1/rtgs'
};

module.exports = settings;
