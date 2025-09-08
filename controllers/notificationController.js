// controllers/notificationController.js
const NotificationSettingsModel = require('../models/notificationSettingsModel'); // Adjust path to your model
const asyncHandler = require('express-async-handler'); // For cleaner async error handling

// Create or update notification settings
const upsertNotificationSettings = asyncHandler(async (req, res) => {
  const { deviceAlerts, systemsUpdate, weeklyReport, securityAlerts, smsNotification, criticalAlerts, phoneNumber } = req.body;

  // Find existing settings for the user
  const existingSettings = await NotificationSettingsModel.findOne({ user_id: req.user._id });

  if (!existingSettings) {
    // Create new settings if none exist
    const notificationSettings = new NotificationSettingsModel({
      deviceAlerts,
      systemsUpdate,
      weeklyReport,
      securityAlerts,
      smsNotification,
      criticalAlerts,
      phoneNumber,
      user_id: req.user._id // Set user_id from authenticated user
    });

    await notificationSettings.save();
    return res.status(201).json({ message: 'Notification settings created successfully', data: notificationSettings });
  }

  // Update existing settings
  existingSettings.deviceAlerts = deviceAlerts ?? existingSettings.deviceAlerts;
  existingSettings.systemsUpdate = systemsUpdate ?? existingSettings.systemsUpdate;
  existingSettings.weeklyReport = weeklyReport ?? existingSettings.weeklyReport;
  existingSettings.securityAlerts = securityAlerts ?? existingSettings.securityAlerts;
  existingSettings.smsNotification = smsNotification ?? existingSettings.smsNotification;
  existingSettings.criticalAlerts = criticalAlerts ?? existingSettings.criticalAlerts;
  existingSettings.phoneNumber = phoneNumber ?? existingSettings.phoneNumber;

  await existingSettings.save();
  res.status(200).json({ message: 'Notification settings updated successfully', data: existingSettings });
});

module.exports = { upsertNotificationSettings };