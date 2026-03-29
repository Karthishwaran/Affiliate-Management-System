const mongoose = require('mongoose');

const affiliateSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  affiliateCode: {
    type: String,
    unique: true,
    uppercase: true
  },
  website: {
    type: String,
    trim: true
  },
  niche: {
    type: String,
    enum: ['Technology', 'Fashion', 'Health', 'Finance', 'Gaming', 'Travel', 'Education', 'Other']
  },
  promotionMethods: [{
    type: String,
    enum: ['Blog', 'Social Media', 'Email Marketing', 'YouTube', 'Paid Ads', 'Other']
  }],
  audienceSize: {
    type: Number,
    default: 0
  },
  taxId: {
    type: String,
    trim: true
  },
  paymentEmail: {
    type: String,
    trim: true,
    lowercase: true
  },
  preferredPaymentMethod: {
    type: String,
    enum: ['PayPal', 'Bank Transfer', 'UPI'],
    default: 'PayPal'
  },
  bankDetails: {
    accountHolderName: String,
    accountNumber: String,
    bankName: String,
    ifscCode: String
  },
  upiId: String,
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'suspended'],
    default: 'pending'
  },
  approvedAt: Date,
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  rejectionReason: String,
  totalEarnings: {
    type: Number,
    default: 0
  },
  pendingCommission: {
    type: Number,
    default: 0
  },
  paidCommission: {
    type: Number,
    default: 0
  },
  totalClicks: {
    type: Number,
    default: 0
  },
  totalConversions: {
    type: Number,
    default: 0
  },
  conversionRate: {
    type: Number,
    default: 0
  },
  averageOrderValue: {
    type: Number,
    default: 0
  },
  performanceScore: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  lastActive: Date,
  notes: String
}, {
  timestamps: true
});

// Generate unique affiliate code before saving
affiliateSchema.pre('save', async function(next) {
  if (!this.affiliateCode) {
    // Generate a unique code
    const generateCode = () => {
      return 'AFF' + Math.random().toString(36).substring(2, 8).toUpperCase();
    };
    
    let code = generateCode();
    let existing = await mongoose.model('Affiliate').findOne({ affiliateCode: code });
    
    while (existing) {
      code = generateCode();
      existing = await mongoose.model('Affiliate').findOne({ affiliateCode: code });
    }
    
    this.affiliateCode = code;
  }
  next();
});

const Affiliate = mongoose.model('Affiliate', affiliateSchema);

module.exports = Affiliate;