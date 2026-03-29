const router = require('express').Router();
const { protect, authorize } = require('../middleware/auth.middleware');
const { getBudgets, getBudget, updateBudget, addExpense, deleteExpense } = require('../controllers/budget.controller');

router.use(protect);
router.get('/', authorize('admin', 'finance'), getBudgets);
router.get('/:projectId', getBudget);
router.patch('/:projectId', authorize('admin', 'finance'), updateBudget);
router.post('/:projectId/expenses', authorize('admin', 'finance'), addExpense);
router.delete('/:projectId/expenses/:expenseId', authorize('admin', 'finance'), deleteExpense);

module.exports = router;
