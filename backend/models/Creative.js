const mongoose = require('mongoose');

const creativeSchema = new mongoose.Schema({
  affiliateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Affiliate',
    required: true
  },
  name: {
    type: String,
    required: [true, 'Creative name is required'],
    trim: true
  },
  type: {
    type: String,
    enum: ['banner', 'text_link', 'email_template', 'social_media', 'landing_page'],
    required: true
  },
  format: {
    type: String,
    enum: ['image', 'html', 'text', 'iframe', 'javascript']
  },
  url: {
    type: String
  },
  imageUrl: {
    type: String
  },
  code: {
    type: String
  },
  dimensions: {
    width: Number,
    height: Number
  },
  targetUrl: {
    type: String,
    required: true
  },
  previewUrl: String,
  clicks: {
    type: Number,
    default: 0
  },
  conversions: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  },
  tags: [String],
  notes: String
}, {
  timestamps: true
});

const Creative = mongoose.model('Creative', creativeSchema);

module.exports = Creative;