const mongoose = require('mongoose');

const grantSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  type: {
    type: String,
    enum: ['internal', 'external'],
    default: 'internal'
  },
  fundingSource: { type: String, default: '' },
  fundingAgency: { type: String, default: '' },
  amount: { type: Number, required: true, default: 0 },
  startDate: { type: Date },
  endDate: { type: Date },
  status: {
    type: String,
    enum: ['draft', 'submitted', 'under_review', 'approved', 'rejected', 'active', 'completed', 'expired'],
    default: 'draft'
  },
  applicant: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  coInvestigators: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
  department: { type: String, default: '' },
  budgetBreakdown: {
    personnel: { type: Number, default: 0 },
    equipment: { type: Number, default: 0 },
    travel: { type: Number, default: 0 },
    materials: { type: Number, default: 0 },
    overhead: { type: Number, default: 0 },
    other: { type: Number, default: 0 }
  },
  compliance: {
    ethicsApproved: { type: Boolean, default: false },
    donorRequirements: { type: String, default: '' },
    reportingSchedule: { type: String, default: '' },
    lastReportDate: Date
  },
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  reviewComment: { type: String, default: '' },
  reviewedAt: Date
}, { timestamps: true });

module.exports = mongoose.model('Grant', grantSchema);
