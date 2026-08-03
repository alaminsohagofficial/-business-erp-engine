const express = require('express');
const router = express.Router();
const controller = require('./controller');

router.post('/', controller.createReconciliation);
router.get('/', controller.getReconciliations);
router.patch('/:id/status', controller.updateReconciliationStatus);

module.exports = router;
