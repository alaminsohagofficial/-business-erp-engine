const Reconciliation = require('../../models/Reconciliation');

// Create Reconciliation Entry
exports.createReconciliation = async (req, res, next) => {
  try {
    const record = await Reconciliation.create(req.body);
    res.status(201).json({ success: true, data: record });
  } catch (error) {
    next(error);
  }
};

// Get Reconciliation Records (Filterable by company & status)
exports.getReconciliations = async (req, res, next) => {
  try {
    const { company, status } = req.query;
    const filter = {};
    if (company) filter.company = company;
    if (status) filter.status = status;

    const records = await Reconciliation.find(filter).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: records.length, data: records });
  } catch (error) {
    next(error);
  }
};

// Process Reconciliation Status Update
exports.updateReconciliationStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, matchedWith, notes } = req.body;

    const updatedRecord = await Reconciliation.findByIdAndUpdate(
      id,
      { status, matchedWith, notes },
      { new: true, runValidators: true }
    );

    if (!updatedRecord) {
      return res.status(404).json({ success: false, error: 'Record not found' });
    }

    res.status(200).json({ success: true, data: updatedRecord });
  } catch (error) {
    next(error);
  }
};
