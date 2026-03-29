const mongoose = require('mongoose');

const payoutSchema = new mongoose.Schema({
  affiliateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Affiliate',
    required: true,
    index: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  commissionIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Commission'
  }],
  paymentMethod: {
    type: String,
    enum: ['PayPal', 'Bank Transfer', 'UPI'],
    required: true
  },
  paymentDetails: {
    paypalEmail: String,
    bankDetails: {
      accountHolderName: String,
      accountNumber: String,
      bankName: String,
      ifscCode: String
    },
    upiId: String
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'cancelled'],
    default: 'pending'
  },
  transactionId: {
    type: String,
    unique: true,
    sparse: true
  },
  tdsAmount: {
    type: Number,
    default: 0
  },
  netAmount: {
    type: Number,
    required: true
  },
  processedAt: Date,
  processedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  failureReason: String,
  notes: String,
  receiptUrl: String
}, {
  timestamps: true
});

// Indexes
payoutSchema.index({ affiliateId: 1, status: 1 });
payoutSchema.index({ createdAt: -1 });

const Payout = mongoose.model('Payout', payoutSchema);

module.exports = Payout;