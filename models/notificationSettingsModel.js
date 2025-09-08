const mongoose = require('mongoose');
const validator = require('validator');

const NotificationSettingsModel = new mongoose.Schema({
  deviceAlerts: {
    type: Boolean,
    default: false
  },
  systemsUpdate: {
    type: Boolean,
    default: false
  },
  weeklyReport: {
    type: Boolean,
    default: false
  },
  securityAlerts: {
    type: Boolean,
    default: false
  },
  smsNotification: {
    type: Boolean,
    default: false
  },
  criticalAlerts: {
    type: Boolean,
    default: false
  },
  phoneNumber: {
    type: String, // Changed to String for proper phone number storage
    trim: true,
    validate: {
      validator: function (value) {
        // Only validate if phoneNumber is provided and smsNotification is true
        if (this.smsNotification && value) {
          return validator.isMobilePhone(value, 'any', { strictMode: true });
        }
        return true; // No validation if smsNotification is false or phoneNumber is not provided
      },
      message: 'Invalid phone number format'
    }
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // References the User model
    required: [true, 'User ID is required']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Ensure only one notification settings document per user
NotificationSettingsModel.index({ user_id: 1 }, { unique: true });

module.exports = mongoose.model('NotificationSettingsModel', NotificationSettingsModel);