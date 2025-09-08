// validations/notificationValidation.js
const Joi = require('joi');

const notificationSettingsSchema = Joi.object({
  deviceAlerts: Joi.boolean().default(false),
  systemsUpdate: Joi.boolean().default(false),
  weeklyReport: Joi.boolean().default(false),
  securityAlerts: Joi.boolean().default(false),
  smsNotification: Joi.boolean().default(false),
  criticalAlerts: Joi.boolean().default(false),
  phoneNumber: Joi.string()
    .when('smsNotification', {
      is: true,
      then: Joi.string()
        .trim()
        .regex(/^\+?[1-9]\d{1,14}$/) // Basic phone number format (E.164)
        .required()
        .messages({ 'string.pattern.base': 'Invalid phone number format' }),
      otherwise: Joi.string().allow('').optional()
    })
});

module.exports = { notificationSettingsSchema };