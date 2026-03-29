const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
  affiliateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Affiliate',
    required: true
  },
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true
  },
  type: {
    type: String,
    enum: ['percentage', 'fixed', 'free_shipping'],
    required: true
  },
  value: {
    type: Number,
    required: true
  },
  minimumOrder: {
    type: Number,
    default: 0
  },
  maximumDiscount: {
    type: Number
  },
  usageLimit: {
    type: Number,
    default: 1
  },
  usedCount: {
    type: Number,
    default: 0
  },
  perUserLimit: {
    type: Number,
    default: 1
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: {
    type: Date
  },
  applicableProducts: [{
    type: mongoose.Schema.Types.ObjectId
  }],
  excludedProducts: [{
    type: mongoose.Schema.Types.ObjectId
  }],
  status: {
    type: String,
    enum: ['active', 'expired', 'disabled'],
    default: 'active'
  },
  description: String
}, {
  timestamps: true
});

couponSchema.methods.isValid = function() {
  const now = new Date();
  return this.status === 'active' && 
         this.usedCount < this.usageLimit &&
         (!this.endDate || this.endDate > now) &&
         this.startDate <= now;
};

const Coupon = mongoose.model('Coupon', couponSchema);

module.exports = Coupon;