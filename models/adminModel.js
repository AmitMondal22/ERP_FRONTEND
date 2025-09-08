const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const AdminSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  secondName: { type: String },
  email: { type: String, required: true, unique: true },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  otp: { type: String, default: '' },
  otpStatus: { type: String, enum: ['active', 'inactive'], default: 'active' },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'superadmin'], required: true }
}, { timestamps: true });

// Hash password before save
AdminSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

module.exports = mongoose.model('Admin', AdminSchema);
