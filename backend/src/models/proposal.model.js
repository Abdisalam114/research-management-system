const mongoose = require('mongoose');

const proposalSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  abstract: { type: String, required: true },
  keywords: [String],
  researchers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: {
    type: String,
    enum: ['draft', 'submitted', 'under_review', 'approved', 'rejected'],
    default: 'draft'
  },
  coordinatorReview: {
    reviewer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    comment: String,
    reviewedAt: Date
  },
  directorDecision: {
    decidedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    comment: String,
    decidedAt: Date
  },
  estimatedBudget: { type: Number, default: 0 },
  duration: { type: Number, default: 12 }, // months
  department: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('Proposal', proposalSchema);
