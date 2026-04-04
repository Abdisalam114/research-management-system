const mongoose = require('mongoose');

const publicationSchema = new mongoose.Schema({
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
  title: { type: String, required: true, trim: true },
  authors: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  authorNames: [String],
  year: { type: Number, required: true },
  journal: { type: String, default: '' },
  conference: { type: String, default: '' },
  doi: { type: String, default: '' },
  abstract: { type: String, default: '' },
  keywords: [String],
  type: {
    type: String,
    enum: ['journal', 'conference', 'book_chapter', 'thesis', 'patent', 'other'],
    default: 'journal'
  },
  impactFactor: { type: Number, default: 0 },
  patentNumber: { type: String, default: '' },
  status: {
    type: String,
    enum: ['draft', 'submitted', 'under_review', 'published', 'rejected'],
    default: 'draft'
  },
  citationCount: { type: Number, default: 0 },
  submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  verifiedAt: Date,
  department: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('Publication', publicationSchema);
