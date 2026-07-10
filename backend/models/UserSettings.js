const mongoose = require('mongoose');

const userSettingsSchema = new mongoose.Schema({
  clerkUserId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  // Profile
  businessName: { type: String, default: '' },
  businessAddress: { type: String, default: '' },
  businessPhone: { type: String, default: '' },
  businessEmail: { type: String, default: '' },

  // Appearance
  theme: {
    type: String,
    enum: ['dark', 'light', 'system'],
    default: 'dark'
  },
  fontSize: {
    type: String,
    enum: ['small', 'medium', 'large'],
    default: 'medium'
  },
  layout: {
    type: String,
    enum: ['comfortable', 'compact'],
    default: 'comfortable'
  },

  // Currency & Timezone
  currency: {
    type: String,
    enum: ['KES', 'USD', 'EUR', 'GBP'],
    default: 'KES'
  },
  timezone: { type: String, default: 'Africa/Nairobi' },

  // Notification Preferences
  notificationPreferences: {
    income: { type: Boolean, default: true },
    expense: { type: Boolean, default: true },
    damage: { type: Boolean, default: true },
    vehicle: { type: Boolean, default: true },
    reports: { type: Boolean, default: true },
    system: { type: Boolean, default: true }
  }
}, { timestamps: true });

module.exports = mongoose.model('UserSettings', userSettingsSchema);