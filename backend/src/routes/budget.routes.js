const router = require('express').Router();
const { protect, authorize } = require('../middleware/auth.middleware');
const { getBudgets, getBudget, updateBudget, addExpense, deleteExpense } = require('../controllers/budget.controller');

router.use(protect);
router.get('/', authorize('director', 'finance'), getBudgets);
router.get('/:projectId', getBudget);
router.patch('/:projectId', authorize('director', 'finance'), updateBudget);
router.post('/:projectId/expenses', authorize('director', 'finance'), addExpense);
router.delete('/:projectId/expenses/:expenseId', authorize('director', 'finance'), deleteExpense);

module.exports = router;
