const mongoose = require('mongoose');

const QuotaSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', unique: true, required: true },
  devicesLimit: Number,
  reportsLimit: Number,
  widgetsLimit: Number,
  emailsLimit: Number,
  messagesLimit: Number
});

module.exports = mongoose.model('Quota', QuotaSchema);
