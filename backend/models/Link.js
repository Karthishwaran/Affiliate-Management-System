const mongoose = require('mongoose');

const linkSchema = new mongoose.Schema({
  affiliateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Affiliate',
    required: true,
    index: true
  },
  name: {
    type: String,
    required: [true, 'Link name is required'],
    trim: true
  },
  code: {
    type: String,
    unique: true,
    required: true
    // unique automatically creates an index
  },
  targetUrl: {
    type: String,
    required: [true, 'Target URL is required'],
    trim: true
  },
  campaignId: {
    type: String,
    index: true
  },
  subIds: [{
    type: String
  }],
  expiryDate: {
    type: Date,
    default: null
  },
  cookieDuration: {
    type: Number,
    default: 30,
    min: 1,
    max: 365
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'expired'],
    default: 'active',
    index: true
  },
  clicks: {
    type: Number,
    default: 0
  },
  uniqueClicks: {
    type: Number,
    default: 0
  },
  conversions: {
    type: Number,
    default: 0
  },
  revenue: {
    type: Number,
    default: 0
  },
  notes: String
}, {
  timestamps: true
});

// Additional compound indexes for performance
linkSchema.index({ affiliateId: 1, status: 1 });
linkSchema.index({ code: 1, status: 1 });

const Link = mongoose.model('Link', linkSchema);

module.exports = Link;