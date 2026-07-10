const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  clerkUserId: {
    type: String,
    required: true,
    index: true
  },
  type: {
    type: String,
    required: true,
    enum: [
      'income_added',
      'expense_added',
      'damage_reported',
      'damage_fixed',
      'car_added',
      'car_updated',
      'car_deleted'
    ]
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  carId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Car',
    default: null
  },
  plateNumber: {
    type: String,
    default: ''
  },
  amount: {
    type: Number,
    default: null
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

activitySchema.index({ clerkUserId: 1, createdAt: -1 });

module.exports = mongoose.model('Activity', activitySchema);