const mongoose = require('mongoose');

const kycSchema = new mongoose.Schema({
  affiliateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Affiliate',
    required: true
  },
  documentType: {
    type: String,
    enum: ['PAN Card', 'Aadhar Card', 'Passport', 'Driving License', 'Bank Statement'],
    required: true
  },
  documentNumber: {
    type: String,
    required: true
  },
  documentUrl: {
    type: String,
    required: true
  },
  publicId: String,
  status: {
    type: String,
    enum: ['pending', 'verified', 'rejected'],
    default: 'pending'
  },
  verifiedAt: Date,
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  rejectionReason: String,
  notes: String
}, {
  timestamps: true
});

const KYC = mongoose.model('KYC', kycSchema);

module.exports = KYC;