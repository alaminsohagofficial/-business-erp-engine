const StockItem = require('../../models/StockItem');

// Add New Inventory Item
exports.addStockItem = async (req, res, next) => {
  try {
    const item = await StockItem.create(req.body);
    res.status(201).json({ success: true, data: item });
  } catch (error) {
    next(error);
  }
};

// Get Inventory Summary by Company
exports.getInventory = async (req, res, next) => {
  try {
    const { company, sku } = req.query;
    const filter = {};
    if (company) filter.company = company;
    if (sku) filter.sku = sku;

    const items = await StockItem.find(filter).sort({ itemName: 1 });
    res.status(200).json({ success: true, count: items.length, data: items });
  } catch (error) {
    next(error);
  }
};

// Adjust Stock Level (Stock Movement)
exports.adjustStock = async (req, res, next) => {
  try {
    const { sku, quantityAdjustment } = req.body;

    const item = await StockItem.findOne({ sku });
    if (!item) {
      return res.status(404).json({ success: false, error: 'SKU not found' });
    }

    item.quantity += quantityAdjustment;
    await item.save();

    res.status(200).json({ success: true, message: 'Stock level updated', data: item });
  } catch (error) {
    next(error);
  }
};
