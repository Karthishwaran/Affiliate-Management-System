const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { protect } = require('../middleware/auth');
const {
  register,
  login,
  refreshToken,
  forgotPassword,
  resetPassword,
  logout
} = require('../controllers/authController');

// Check if all functions exist
console.log('Auth controller functions:', {
  register: typeof register,
  login: typeof login,
  refreshToken: typeof refreshToken,
  forgotPassword: typeof forgotPassword,
  resetPassword: typeof resetPassword,
  logout: typeof logout
});

// Validation rules
const registerValidation = [
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('name').notEmpty().withMessage('Name is required'),
  body('phone').optional().isMobilePhone().withMessage('Please provide a valid phone number')
];

const loginValidation = [
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required')
];

const forgotPasswordValidation = [
  body('email').isEmail().withMessage('Please provide a valid email')
];

const resetPasswordValidation = [
  body('token').notEmpty().withMessage('Reset token is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
];

// Routes
router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);
router.post('/refresh-token', refreshToken);
router.post('/forgot-password', forgotPasswordValidation, forgotPassword);
router.post('/reset-password', resetPasswordValidation, resetPassword);
router.post('/logout', protect, logout);

module.exports = router;