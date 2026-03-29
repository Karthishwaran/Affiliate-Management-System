const mongoose = require('mongoose');

const clickSchema = new mongoose.Schema({
  affiliateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Affiliate',
    required: true,
    index: true  // Keep one index declaration
  },
  linkId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Link',
    required: true,
    index: true  // Keep one index declaration
  },
  clickId: {
    type: String,
    unique: true,
    required: true
    // Remove index: true here since unique creates an index
  },
  ip: {
    type: String,
    required: true
  },
  userAgent: {
    type: String,
    required: true
  },
  referrer: {
    type: String
  },
  device: {
    type: String,
    enum: ['desktop', 'mobile', 'tablet', 'unknown'],
    default: 'unknown'
  },
  browser: {
    type: String
  },
  os: {
    type: String
  },
  country: {
    type: String
  },
  city: {
    type: String
  },
  subId: {
    type: String,
    index: true
  },
  isUnique: {
    type: Boolean,
    default: true
  },
  isBot: {
    type: Boolean,
    default: false
  },
  fraudScore: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  converted: {
    type: Boolean,
    default: false
  },
  conversionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conversion'
  },
  cookieData: {
    type: mongoose.Schema.Types.Mixed
  },
  expiresAt: {
    type: Date,
    index: { expires: 90 }
  }
}, {
  timestamps: true
});

// Create compound indexes (these are additional, not duplicates)
clickSchema.index({ affiliateId: 1, createdAt: -1 });
clickSchema.index({ linkId: 1, createdAt: -1 });
clickSchema.index({ ip: 1, createdAt: -1 });

const Click = mongoose.model('Click', clickSchema);

module.exports = Click;