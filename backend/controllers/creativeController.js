const Creative = require('../models/Creative');
const Affiliate = require('../models/Affiliate');
const { uploadToCloudinary } = require('../utils/cloudinary');

// @desc    Get creatives library
// @route   GET /api/creatives
// @access  Private (Affiliate)
exports.getCreatives = async (req, res) => {
  try {
    const { type, page = 1, limit = 50 } = req.query;
    
    const affiliate = await Affiliate.findOne({ userId: req.user._id });
    
    if (!affiliate) {
      return res.status(404).json({
        success: false,
        message: 'Affiliate profile not found'
      });
    }

    const query = { 
      affiliateId: affiliate._id,
      status: 'active'
    };
    
    if (type) query.type = type;

    const creatives = await Creative.find(query)
      .sort('-createdAt')
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Creative.countDocuments(query);

    res.json({
      success: true,
      data: {
        creatives,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get creatives error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching creatives'
    });
  }
};

// @desc    Create new creative
// @route   POST /api/creatives
// @access  Private (Affiliate)
exports.createCreative = async (req, res) => {
  try {
    const {
      name,
      type,
      format,
      code,
      targetUrl,
      dimensions,
      tags
    } = req.body;

    const affiliate = await Affiliate.findOne({ userId: req.user._id });
    
    if (!affiliate) {
      return res.status(404).json({
        success: false,
        message: 'Affiliate profile not found'
      });
    }

    let imageUrl = null;
    if (req.file) {
      const uploadResult = await uploadToCloudinary(req.file.path, 'creatives');
      imageUrl = uploadResult.secure_url;
    }

    const creative = await Creative.create({
      affiliateId: affiliate._id,
      name,
      type,
      format,
      code,
      targetUrl,
      dimensions,
      tags: tags ? tags.split(',') : [],
      imageUrl
    });

    res.status(201).json({
      success: true,
      data: creative,
      message: 'Creative created successfully'
    });
  } catch (error) {
    console.error('Create creative error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating creative'
    });
  }
};

// @desc    Update creative
// @route   PUT /api/creatives/:id
// @access  Private (Affiliate)
exports.updateCreative = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, status, targetUrl } = req.body;

    const affiliate = await Affiliate.findOne({ userId: req.user._id });
    
    const creative = await Creative.findOne({ _id: id, affiliateId: affiliate._id });
    
    if (!creative) {
      return res.status(404).json({
        success: false,
        message: 'Creative not found'
      });
    }

    if (name) creative.name = name;
    if (status) creative.status = status;
    if (targetUrl) creative.targetUrl = targetUrl;

    await creative.save();

    res.json({
      success: true,
      data: creative,
      message: 'Creative updated successfully'
    });
  } catch (error) {
    console.error('Update creative error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating creative'
    });
  }
};

// @desc    Delete creative
// @route   DELETE /api/creatives/:id
// @access  Private (Affiliate)
exports.deleteCreative = async (req, res) => {
  try {
    const { id } = req.params;
    
    const affiliate = await Affiliate.findOne({ userId: req.user._id });
    
    const creative = await Creative.findOne({ _id: id, affiliateId: affiliate._id });
    
    if (!creative) {
      return res.status(404).json({
        success: false,
        message: 'Creative not found'
      });
    }

    await creative.remove();

    res.json({
      success: true,
      message: 'Creative deleted successfully'
    });
  } catch (error) {
    console.error('Delete creative error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting creative'
    });
  }
};

// @desc    Get creative HTML code
// @route   GET /api/creatives/:id/code
// @access  Private (Affiliate)
exports.getCreativeCode = async (req, res) => {
  try {
    const { id } = req.params;
    
    const affiliate = await Affiliate.findOne({ userId: req.user._id });
    
    const creative = await Creative.findOne({ _id: id, affiliateId: affiliate._id });
    
    if (!creative) {
      return res.status(404).json({
        success: false,
        message: 'Creative not found'
      });
    }

    // Generate tracking code based on creative type
    let htmlCode = '';
    const trackingUrl = `${process.env.BASE_URL}/track/click/${affiliate.affiliateCode}?creative=${creative._id}`;

    switch (creative.type) {
      case 'banner':
        htmlCode = `<a href="${trackingUrl}" target="_blank">
          <img src="${creative.imageUrl}" alt="${creative.name}" 
               width="${creative.dimensions?.width || 300}" 
               height="${creative.dimensions?.height || 250}" />
        </a>`;
        break;
      case 'text_link':
        htmlCode = `<a href="${trackingUrl}" target="_blank">${creative.name}</a>`;
        break;
      case 'html':
        htmlCode = creative.code;
        break;
      default:
        htmlCode = `<a href="${trackingUrl}" target="_blank">${creative.name}</a>`;
    }

    res.json({
      success: true,
      data: {
        code: htmlCode,
        trackingUrl,
        preview: creative.previewUrl || trackingUrl
      }
    });
  } catch (error) {
    console.error('Get creative code error:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating creative code'
    });
  }
};