const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();
const Transaction = require('./models/Transaction');

const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(express.json());
// ড্যাশবোর্ড ফ্রন্টএন্ড কানেক্ট করার জন্য নিচের লাইনটি যোগ করা হয়েছে:
app.use(express.static('public'));

// ডাটাবেজ কানেকশন এবং অটোমেটিক সিডিং
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/erp_engine';
mongoose.connect(MONGO_URI)
  .then(async () => {
    console.log('MongoDB Connected Successfully');
    
    const count = await Transaction.countDocuments();
    if (count === 0) {
      console.log('Database empty! Auto-seeding initial data...');
      const seedData = [
        { dealerId: 'DEAL002905', dealerName: 'S.R ELECTRONICS PARK', companyName: 'MINISTER_MYONE', bankName: 'Islami Bank PLC to DBBL', transactionType: 'Fund_Transfer', coreTrxId: 'IBBLFT260701831', valueDate: new Date('2026-07-01'), amount: 13269545, status: 'DISPUTED', narration: 'PAYMENT FOR GOODS (450 UNITS)' },
        { dealerId: '3000002272', dealerName: 'SR ELECTRONICS PARK', companyName: 'BUTTERFLY_MARKETING', bankName: 'Dutch-Bangla Bank PLC', transactionType: 'NexusPay', coreTrxId: 'LID02207261502', valueDate: new Date('2026-07-26'), amount: 150000, status: 'SUCCESS', narration: 'NexusPay- Butterfly Vendor Pay' },
        { dealerId: '3000002272', dealerName: 'SR ELECTRONICS PARK', companyName: 'BUTTERFLY_MARKETING', bankName: 'City Bank to DBBL', transactionType: 'RTGS', coreTrxId: 'CITYRTGS69545663BD', valueDate: new Date('2026-05-16'), amount: 2000000, status: 'PAID_AND_POSTED', narration: 'RTGS Fund Transfer Received' },
        { dealerId: '3000002272', dealerName: 'SR ELECTRONICS PARK', companyName: 'BUTTERFLY_MARKETING', bankName: 'City Bank to DBBL', transactionType: 'RTGS', coreTrxId: 'CITYRTGS14445505BD', valueDate: new Date('2026-05-16'), amount: 2000000, status: 'PAID_AND_POSTED', narration: 'Additional RTGS Fund' },
        { dealerId: '3000002272', dealerName: 'SR ELECTRONICS PARK', companyName: 'BUTTERFLY_MARKETING', bankName: 'City Bank to DBBL', transactionType: 'RTGS', coreTrxId: 'CITYRTGS77889911BD', valueDate: new Date('2026-05-16'), amount: 7000000, status: 'PAID_AND_POSTED', narration: 'Additional RTGS Fund (+7M)' },
        { dealerId: '3000002272', dealerName: 'SR ELECTRONICS PARK', companyName: 'BUTTERFLY_MARKETING', bankName: 'City Bank to DBBL', transactionType: 'RTGS', coreTrxId: 'CITYRTGS99887766BD', valueDate: new Date('2026-05-16'), amount: 9000000, status: 'PAID_AND_POSTED', narration: 'Additional RTGS Fund (+9M)' },
        { dealerId: '3107053000068', dealerName: 'S. R ELECTRONIC PARK(CC)', companyName: 'SONALI_BANK_CSS', bankName: 'Sonali Bank PLC', transactionType: 'Fund_Transfer', coreTrxId: 'SBP/HTB/FT/2026/07-31070', valueDate: new Date('2026-07-29'), amount: 300000, status: 'SUCCESS', narration: 'Continuous Credit to CSS NGO' }
      ];
      await Transaction.insertMany(seedData);
      console.log('Auto-seeding complete!');
    }
  })
  .catch(err => console.log('MongoDB Connection Notice:', err.message));

const erpRoutes = require('./routes/erp');
app.use('/api/erp', erpRoutes);

app.listen(PORT, () => {
  console.log(`ERP Engine is running on port ${PORT}`);
});
