// routes/notificationRoutes.js
const express = require('express');
const router = express.Router();
const { upsertNotificationSettings } = require('../controllers/notificationController');
const validate = require('../middleware/validate');
const { notificationSettingsSchema } = require('../validations/notificationValidation');
const auth = require('../middleware/auth');

router.post('/notifications', auth, validate(notificationSettingsSchema), upsertNotificationSettings);

module.exports = router;