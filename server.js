const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Database Connection
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('MongoDB Connected Successfully'))
.catch(err => console.error('Database connection error:', err));

// Routes
const ledgerRoutes = require('./routes/ledgerRoutes');
app.use('/api/ledgers', ledgerRoutes);

app.get('/', (req, res) => {
    res.send('Business ERP Engine API is running...');
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
