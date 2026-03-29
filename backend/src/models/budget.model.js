const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  description: { type: String, required: true },
  amount: { type: Number, required: true },
  category: {
    type: String,
    enum: ['equipment', 'travel', 'personnel', 'materials', 'overhead', 'other'],
    default: 'other'
  },
  date: { type: Date, default: Date.now },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  receipt: { type: String, default: '' }
});

const budgetSchema = new mongoose.Schema({
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true, unique: true },
  totalBudget: { type: Number, required: true, default: 0 },
  allocatedAmount: { type: Number, default: 0 },
  expenses: [expenseSchema],
  notes: { type: String, default: '' }
}, { timestamps: true });

budgetSchema.virtual('totalExpenses').get(function () {
  return this.expenses.reduce((sum, e) => sum + e.amount, 0);
});

budgetSchema.virtual('remainingBalance').get(function () {
  return this.totalBudget - this.expenses.reduce((sum, e) => sum + e.amount, 0);
});

budgetSchema.set('toJSON', { virtuals: true });
budgetSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Budget', budgetSchema);
