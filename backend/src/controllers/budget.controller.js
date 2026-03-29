const Budget = require('../models/budget.model');

// GET /api/budgets
exports.getBudgets = async (req, res, next) => {
  try {
    const budgets = await Budget.find()
      .populate('project', 'title status department')
      .sort({ createdAt: -1 });
    res.json(budgets);
  } catch (err) { next(err); }
};

// GET /api/budgets/:projectId
exports.getBudget = async (req, res, next) => {
  try {
    const budget = await Budget.findOne({ project: req.params.projectId })
      .populate('project', 'title status department leadResearcher');
    if (!budget) return res.status(404).json({ message: 'Budget not found for this project' });
    res.json(budget);
  } catch (err) { next(err); }
};

// PATCH /api/budgets/:projectId (update total budget)
exports.updateBudget = async (req, res, next) => {
  try {
    const { totalBudget, notes } = req.body;
    const budget = await Budget.findOneAndUpdate(
      { project: req.params.projectId },
      { totalBudget, notes },
      { new: true, upsert: true }
    ).populate('project', 'title');
    res.json(budget);
  } catch (err) { next(err); }
};

// POST /api/budgets/:projectId/expenses
exports.addExpense = async (req, res, next) => {
  try {
    const { description, amount, category, date, receipt } = req.body;
    const budget = await Budget.findOne({ project: req.params.projectId });
    if (!budget) return res.status(404).json({ message: 'Budget not found' });
    budget.expenses.push({ description, amount, category, date, receipt, approvedBy: req.user._id });
    await budget.save();
    res.status(201).json(budget);
  } catch (err) { next(err); }
};

// DELETE /api/budgets/:projectId/expenses/:expenseId
exports.deleteExpense = async (req, res, next) => {
  try {
    const budget = await Budget.findOne({ project: req.params.projectId });
    if (!budget) return res.status(404).json({ message: 'Budget not found' });
    budget.expenses = budget.expenses.filter(e => e._id.toString() !== req.params.expenseId);
    await budget.save();
    res.json(budget);
  } catch (err) { next(err); }
};
