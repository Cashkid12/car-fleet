const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  clerkUserId: {
    type: String,
    required: true,
    index: true
  },
  type: {
    type: String,
    required: true,
    enum: [
      'income_added', 'income_updated', 'income_deleted',
      'expense_added', 'expense_updated', 'expense_deleted',
      'damage_reported', 'repair_started', 'repair_completed',
      'vehicle_added', 'vehicle_updated', 'vehicle_deleted',
      'report_generated', 'system_message'
    ]
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  priority: {
    type: String,
    enum: ['high', 'medium', 'low'],
    default: 'medium'
  },
  isRead: { type: Boolean, default: false, index: true },
  relatedId: { type: mongoose.Schema.Types.ObjectId, default: null },
  relatedType: { type: String, default: '' },
  plateNumber: { type: String, default: '' },
  referenceNumber: { type: String, default: '' },
  metadata: { type: mongoose.Schema.Types.Mixed, default: {} }
}, { timestamps: true });

notificationSchema.index({ clerkUserId: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ clerkUserId: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);