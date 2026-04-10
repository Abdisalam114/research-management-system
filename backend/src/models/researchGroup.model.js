const mongoose = require('mongoose');

const researchGroupSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  faculty: { type: String, default: '' },
  department: { type: String, default: '' },
  researchThemes: [String],
  leader: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  members: [{
    studentId: { type: String, trim: true },
    studentName: { type: String, trim: true },
    faculty: { type: String, trim: true },
    department: { type: String, trim: true },
    className: { type: String, trim: true }
  }],
  projects: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Project' }],
  publications: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Publication' }],
  status: {
    type: String,
    enum: ['active', 'inactive', 'archived'],
    default: 'active'
  },
  isInterdisciplinary: { type: Boolean, default: false },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('ResearchGroup', researchGroupSchema);
