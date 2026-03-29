const mongoose = require('mongoose');

const commissionSchema = new mongoose.Schema({
  affiliateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Affiliate',
    required: true
  },
  conversionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conversion',
    required: true
  },
  orderId: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  type: {
    type: String,
    enum: ['flat', 'percentage', 'hybrid'],
    default: 'percentage'
  },
  rate: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'paid', 'cancelled'],
    default: 'pending'
  },
  tier: {
    type: Number,
    default: 1
  },
  parentCommissionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Commission'
  },
  paymentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Payout'
  },
  notes: String,
  adjustmentReason: String,
  adjustedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

const Commission = mongoose.model('Commission', commissionSchema);

module.exports = Commission;