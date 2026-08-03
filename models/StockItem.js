const mongoose = require('mongoose');

const stockItemSchema = new mongoose.Schema({
  company: {
    type: String,
    required: true,
    enum: ['Minister-Myone Group', 'Butterfly Marketing Ltd', 'Salsabilah Amin Ltd']
  },
  sku: { type: String, required: true, unique: true },
  itemName: { type: String, required: true },
  category: { type: String, required: true },
  quantity: { type: Number, required: true, default: 0 },
  unitPrice: { type: Number, required: true },
  warehouseLocation: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('StockItem', stockItemSchema);
