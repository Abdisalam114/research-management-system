const mongoose = require('mongoose');

const versionSchema = new mongoose.Schema({
  versionNumber: { type: Number, required: true },
  title: String,
  abstract: String,
  changes: { type: String, default: '' },
  savedAt: { type: Date, default: Date.now },
  savedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

const proposalSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  abstract: { type: String, required: true },
  keywords: [String],
  researchers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: {
    type: String,
    enum: ['draft', 'submitted', 'under_review', 'revision_requested', 'approved', 'rejected'],
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
  ethicsApproval: {
    required: { type: Boolean, default: false },
    status: { type: String, enum: ['pending', 'approved', 'rejected', 'not_required'], default: 'not_required' },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    approvedAt: Date,
    comment: String
  },
  documents: [{
    name: { type: String },
    url: { type: String },
    type: { type: String, enum: ['proposal', 'ethics', 'budget', 'supporting'], default: 'proposal' },
    uploadedAt: { type: Date, default: Date.now }
  }],
  versions: [versionSchema],
  currentVersion: { type: Number, default: 1 },
  estimatedBudget: { type: Number, default: 0 },
  duration: { type: Number, default: 12 },
  department: { type: String, default: '' },
  assignedReviewer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('Proposal', proposalSchema);
