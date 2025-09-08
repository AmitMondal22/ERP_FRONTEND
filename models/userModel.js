const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  user: {
    firstName: String,
    lastName: String
  },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  role: String,
  status: String,
  notes: String,
  verificationCode: Number,
  createdAt: { type: Date, default: Date.now }
});


// Password hash
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Compare password
UserSchema.methods.comparePassword = function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
