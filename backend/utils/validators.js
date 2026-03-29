const Joi = require('joi');

// User registration validation
const registerSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  phone: Joi.string().pattern(/^[0-9+\-\s()]+$/).optional()
});

// Login validation
const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

// Affiliate profile validation
const affiliateProfileSchema = Joi.object({
  website: Joi.string().uri().optional(),
  niche: Joi.string().valid('Technology', 'Fashion', 'Health', 'Finance', 'Gaming', 'Travel', 'Education', 'Other').optional(),
  promotionMethods: Joi.array().items(Joi.string().valid('Blog', 'Social Media', 'Email Marketing', 'YouTube', 'Paid Ads', 'Other')).optional(),
  audienceSize: Joi.number().integer().min(0).optional(),
  paymentEmail: Joi.string().email().optional(),
  preferredPaymentMethod: Joi.string().valid('PayPal', 'Bank Transfer', 'UPI').optional(),
  bankDetails: Joi.object({
    accountHolderName: Joi.string(),
    accountNumber: Joi.string(),
    bankName: Joi.string(),
    ifscCode: Joi.string()
  }).optional(),
  upiId: Joi.string().optional()
});

// Link creation validation
const linkSchema = Joi.object({
  name: Joi.string().required(),
  targetUrl: Joi.string().uri().required(),
  campaignId: Joi.string().optional(),
  subIds: Joi.array().items(Joi.string()).optional(),
  expiryDays: Joi.number().integer().min(1).max(365).optional(),
  cookieDuration: Joi.number().integer().min(1).max(365).optional()
});

// Conversion validation
const conversionSchema = Joi.object({
  clickId: Joi.string().optional(),
  orderId: Joi.string().required(),
  amount: Joi.number().positive().required(),
  conversionType: Joi.string().valid('sale', 'lead', 'signup', 'custom').default('sale'),
  productId: Joi.string().optional(),
  customData: Joi.object().optional()
});

// Payout request validation
const payoutSchema = Joi.object({
  amount: Joi.number().positive().required(),
  paymentMethod: Joi.string().valid('PayPal', 'Bank Transfer', 'UPI').required(),
  paymentDetails: Joi.object().optional()
});

// Validate function
const validate = (schema, data) => {
  const { error, value } = schema.validate(data, { abortEarly: false });
  if (error) {
    const errors = error.details.map(detail => ({
      field: detail.path.join('.'),
      message: detail.message
    }));
    return { error: true, errors };
  }
  return { error: false, value };
};

module.exports = {
  registerSchema,
  loginSchema,
  affiliateProfileSchema,
  linkSchema,
  conversionSchema,
  payoutSchema,
  validate
};