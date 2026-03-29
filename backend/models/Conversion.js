const mongoose = require('mongoose');

const conversionSchema = new mongoose.Schema({
  clickId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Click',
    required: true
  },
  affiliateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Affiliate',
    required: true,
    index: true
  },
  linkId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Link',
    required: true
  },
  orderId: {
    type: String,
    required: true,
    unique: true
    // Remove index: true here since unique creates an index
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  commission: {
    type: Number,
    default: 0
  },
  commissionRate: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'fraud'],
    default: 'pending',
    index: true
  },
  conversionType: {
    type: String,
    enum: ['sale', 'lead', 'signup', 'custom'],
    default: 'sale'
  },
  ip: String,
  userAgent: String,
  device: String,
  browser: String,
  os: String,
  country: String,
  city: String,
  subId: String,
  customData: mongoose.Schema.Types.Mixed,
  fraudScore: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  fraudReason: String,
  approvedAt: Date,
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  notes: String
}, {
  timestamps: true
});

// Create compound indexes (these are additional)
conversionSchema.index({ affiliateId: 1, createdAt: -1 });
conversionSchema.index({ status: 1, createdAt: -1 });

const Conversion = mongoose.model('Conversion', conversionSchema);

module.exports = Conversion;