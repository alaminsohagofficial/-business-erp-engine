const express = require('express');
const router = express.Router();
const controller = require('./controller');

router.post('/item', controller.addStockItem);
router.get('/', controller.getInventory);
router.post('/adjust', controller.adjustStock);

module.exports = router;
