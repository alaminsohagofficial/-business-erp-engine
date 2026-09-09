const mongoose = require('mongoose');

const ledgerSchema = new mongoose.Schema({
    entity: { 
        type: String, 
        required: true, 
        enum: ['Butterfly Marketing Ltd.', 'Minister Hi-Tech Park'] 
    },
    dealerCode: { type: String, required: true },
    date: { type: Date, required: true },
    desc: { type: String, required: true },
    channel: { 
        type: String, 
        required: true, 
        enum: ['RTGS', 'EFT', 'NexusPay', 'Aggregation'] 
    },
    ref: { type: String, required: true, unique: true },
    type: { type: String, required: true, enum: ['Credit', 'Debit'] },
    amount: { type: Number, required: true },
    status: { type: String, default: 'Reconciled' }
}, { timestamps: true });

module.exports = mongoose.model('Ledger', ledgerSchema);
