const mongoose = require('mongoose');

const repositorySchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  type: {
    type: String,
    enum: ['proposal', 'dataset', 'publication', 'thesis', 'report', 'other'],
    required: true
  },
  authors: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  authorNames: [String],
  department: { type: String, default: '' },
  keywords: [String],
  abstract: { type: String, default: '' },
  year: { type: Number, default: () => new Date().getFullYear() },
  files: [{
    name: String,
    url: String,
    size: Number,
    mimeType: String,
    uploadedAt: { type: Date, default: Date.now }
  }],
  doi: { type: String, default: '' },
  isbn: { type: String, default: '' },
  language: { type: String, default: 'English' },
  license: {
    type: String,
    enum: ['cc-by', 'cc-by-sa', 'cc-by-nc', 'cc-by-nd', 'all-rights-reserved', 'public-domain'],
    default: 'all-rights-reserved'
  },
  accessLevel: {
    type: String,
    enum: ['public', 'institutional', 'restricted'],
    default: 'institutional'
  },
  status: {
    type: String,
    enum: ['draft', 'under_review', 'approved', 'published', 'archived'],
    default: 'draft'
  },
  // Links to related records
  relatedProposal: { type: mongoose.Schema.Types.ObjectId, ref: 'Proposal' },
  relatedProject: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
  relatedPublication: { type: mongoose.Schema.Types.ObjectId, ref: 'Publication' },

  // Plagiarism check
  plagiarismCheck: {
    status: { type: String, enum: ['not_checked', 'pending', 'passed', 'flagged'], default: 'not_checked' },
    score: { type: Number, default: 0 },
    provider: { type: String, default: '' },
    checkedAt: Date,
    reportUrl: { type: String, default: '' }
  },

  // ORCID / DOI sync
  orcidSynced: { type: Boolean, default: false },
  institutionalRepoUrl: { type: String, default: '' },

  submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  reviewComment: { type: String, default: '' },
  reviewedAt: Date,
  publishedAt: Date,

  viewCount: { type: Number, default: 0 },
  downloadCount: { type: Number, default: 0 }
}, { timestamps: true });

repositorySchema.index({ title: 'text', keywords: 'text', abstract: 'text' });

module.exports = mongoose.model('Repository', repositorySchema);
