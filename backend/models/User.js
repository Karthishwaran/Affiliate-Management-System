const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  phone: {
    type: String,
    default: ''
  },
  role: {
    type: String,
    enum: ['affiliate', 'admin', 'manager'],
    default: 'affiliate'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  refreshToken: String,
  lastLogin: Date,
  resetPasswordToken: String,
  resetPasswordExpire: Date
}, {
  timestamps: true
});

// NO PRE-SAVE MIDDLEWARE HERE

const User = mongoose.model('User', userSchema);

module.exports = User;