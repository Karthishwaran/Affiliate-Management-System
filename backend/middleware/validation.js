const { body, validationResult } = require('express-validator');

// Validate affiliate registration
exports.validateAffiliateRegistration = [
  body('website').optional().isURL().withMessage('Please provide a valid website URL'),
  body('niche').optional().isIn(['Technology', 'Fashion', 'Health', 'Finance', 'Gaming', 'Travel', 'Education', 'Other']),
  body('paymentEmail').optional().isEmail().withMessage('Please provide a valid payment email'),
  body('preferredPaymentMethod').optional().isIn(['PayPal', 'Bank Transfer', 'UPI'])
];

// Validate link creation
exports.validateLinkCreation = [
  body('name').notEmpty().withMessage('Link name is required'),
  body('targetUrl').isURL().withMessage('Please provide a valid target URL'),
  body('cookieDuration').optional().isInt({ min: 1, max: 365 }).withMessage('Cookie duration must be between 1 and 365 days')
];

// Validate conversion registration
exports.validateConversion = [
  body('orderId').notEmpty().withMessage('Order ID is required'),
  body('amount').isFloat({ min: 0 }).withMessage('Amount must be a positive number'),
  body('conversionType').optional().isIn(['sale', 'lead', 'signup', 'custom'])
];

// Validation error handler
exports.handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }
  next();
};