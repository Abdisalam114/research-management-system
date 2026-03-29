const mongoose = require('mongoose');

const milestoneSchema = new mongoose.Schema({
  title: String,
  dueDate: Date,
  completed: { type: Boolean, default: false }
});

const projectSchema = new mongoose.Schema({
  proposal: { type: mongoose.Schema.Types.ObjectId, ref: 'Proposal', required: true },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  team: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  leadResearcher: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  startDate: { type: Date },
  endDate: { type: Date },
  status: {
    type: String,
    enum: ['planning', 'active', 'on_hold', 'completed', 'cancelled'],
    default: 'planning'
  },
  milestones: [milestoneSchema],
  department: { type: String, default: '' },
  progress: { type: Number, default: 0, min: 0, max: 100 }
}, { timestamps: true });

module.exports = mongoose.model('Project', projectSchema);
