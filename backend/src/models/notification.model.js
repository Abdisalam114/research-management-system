const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  type: {
    type: String,
    enum: [
      'proposal_submitted', 'proposal_reviewed', 'proposal_approved', 'proposal_rejected',
      'project_update', 'project_completed',
      'publication_submitted', 'publication_verified',
      'grant_submitted', 'grant_approved', 'grant_rejected',
      'budget_approved', 'expense_added',
      'user_approved', 'user_rejected',
      'message', 'system'
    ],
    required: true
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  read: { type: Boolean, default: false },
  link: { type: String, default: '' },
  relatedModel: { type: String, default: '' },
  relatedId: { type: mongoose.Schema.Types.ObjectId }
}, { timestamps: true });

notificationSchema.index({ recipient: 1, read: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
