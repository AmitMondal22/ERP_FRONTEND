const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');


exports.loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log(email);
    // Check if admin exists
    const admin = await User.findOne({ email });
    if (!admin) {
      return res.status(404).json({ error: 'Admin not found' });
    }

    // Compare password using bcrypt
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Generate JWT Token
    const token = jwt.sign(
      { id: admin._id, email: admin.email, role: admin.role },
      process.env.JWT_SECRET || 'jwt_secret',
      { expiresIn: '2h' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: admin._id,
        email: admin.email,
        firstName: admin.firstName,
        secondName: admin.secondName,
        role: admin.role,
        status: admin.status
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};




// Change user password
exports.changePassword = async (req, res) => {
  const { currentPassword, newPassword, confirmPassword } = req.body;

  // Find the user
  const user = await User.findById(req.user._id);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  // Verify current password
  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) {
    return res.status(400).json({ message: 'Current password is incorrect' });
  }

  // Update password
  user.password = newPassword; // Will be hashed by pre-save middleware
  await user.save();

  res.status(200).json({ message: 'Password changed successfully' });
}