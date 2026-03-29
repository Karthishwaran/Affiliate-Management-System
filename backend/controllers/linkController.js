const Link = require('../models/Link');
const Affiliate = require('../models/Affiliate');
const Click = require('../models/Click');
const { generateUniqueCode } = require('../utils/helpers');

// @desc    Create new affiliate link
// @route   POST /api/links/create
// @access  Private (Affiliate)
exports.createLink = async (req, res) => {
  try {
    const {
      name,
      targetUrl,
      campaignId,
      subIds,
      expiryDays,
      cookieDuration
    } = req.body;

    const affiliate = await Affiliate.findOne({ userId: req.user._id });
    
    if (!affiliate) {
      return res.status(404).json({
        success: false,
        message: 'Affiliate profile not found'
      });
    }

    const link = await Link.create({
      affiliateId: affiliate._id,
      name,
      targetUrl,
      campaignId,
      subIds: subIds || [],
      expiryDate: expiryDays ? new Date(Date.now() + expiryDays * 24 * 60 * 60 * 1000) : null,
      cookieDuration: cookieDuration || 30,
      code: generateUniqueCode()
    });

    // Generate full tracking URL
    const trackingUrl = `${process.env.BASE_URL}/track/click/${link.code}`;

    res.status(201).json({
      success: true,
      data: {
        ...link.toObject(),
        trackingUrl
      },
      message: 'Link created successfully'
    });
  } catch (error) {
    console.error('Create link error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating link'
    });
  }
};

// @desc    Get all affiliate links
// @route   GET /api/links
// @access  Private (Affiliate)
exports.getLinks = async (req, res) => {
  try {
    const { page = 1, limit = 50, status, search } = req.query;
    
    const affiliate = await Affiliate.findOne({ userId: req.user._id });
    
    if (!affiliate) {
      return res.status(404).json({
        success: false,
        message: 'Affiliate profile not found'
      });
    }

    const query = { affiliateId: affiliate._id };
    
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } }
      ];
    }

    const links = await Link.find(query)
      .sort('-createdAt')
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Link.countDocuments(query);

    // Add tracking URLs
    const linksWithUrls = links.map(link => ({
      ...link.toObject(),
      trackingUrl: `${process.env.BASE_URL}/track/click/${link.code}`
    }));

    res.json({
      success: true,
      data: {
        links: linksWithUrls,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get links error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching links'
    });
  }
};

// @desc    Update link
// @route   PUT /api/links/:id
// @access  Private (Affiliate)
exports.updateLink = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, targetUrl, campaignId, status } = req.body;

    const affiliate = await Affiliate.findOne({ userId: req.user._id });
    
    const link = await Link.findOne({ _id: id, affiliateId: affiliate._id });
    
    if (!link) {
      return res.status(404).json({
        success: false,
        message: 'Link not found'
      });
    }

    if (name) link.name = name;
    if (targetUrl) link.targetUrl = targetUrl;
    if (campaignId) link.campaignId = campaignId;
    if (status) link.status = status;

    await link.save();

    res.json({
      success: true,
      data: link,
      message: 'Link updated successfully'
    });
  } catch (error) {
    console.error('Update link error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating link'
    });
  }
};

// @desc    Delete link
// @route   DELETE /api/links/:id
// @access  Private (Affiliate)
exports.deleteLink = async (req, res) => {
  try {
    const { id } = req.params;
    
    const affiliate = await Affiliate.findOne({ userId: req.user._id });
    
    const link = await Link.findOne({ _id: id, affiliateId: affiliate._id });
    
    if (!link) {
      return res.status(404).json({
        success: false,
        message: 'Link not found'
      });
    }

    await link.remove();

    res.json({
      success: true,
      message: 'Link deleted successfully'
    });
  } catch (error) {
    console.error('Delete link error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting link'
    });
  }
};

// @desc    Get link statistics
// @route   GET /api/links/:id/stats
// @access  Private (Affiliate)
exports.getLinkStats = async (req, res) => {
  try {
    const { id } = req.params;
    const { period = '30d' } = req.query;

    const affiliate = await Affiliate.findOne({ userId: req.user._id });
    
    const link = await Link.findOne({ _id: id, affiliateId: affiliate._id });
    
    if (!link) {
      return res.status(404).json({
        success: false,
        message: 'Link not found'
      });
    }

    let startDate = new Date();
    switch (period) {
      case '7d':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(startDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(startDate.getDate() - 90);
        break;
      default:
        startDate.setDate(startDate.getDate() - 30);
    }

    const clicks = await Click.find({
      linkId: link._id,
      createdAt: { $gte: startDate }
    });

    const conversions = await Click.find({
      linkId: link._id,
      converted: true,
      createdAt: { $gte: startDate }
    });

    // Daily breakdown
    const dailyStats = {};
    clicks.forEach(click => {
      const date = click.createdAt.toISOString().split('T')[0];
      if (!dailyStats[date]) {
        dailyStats[date] = { clicks: 0, conversions: 0 };
      }
      dailyStats[date].clicks++;
      if (click.converted) {
        dailyStats[date].conversions++;
      }
    });

    const dailyData = Object.entries(dailyStats).map(([date, stats]) => ({
      date,
      ...stats,
      conversionRate: stats.clicks > 0 ? (stats.conversions / stats.clicks) * 100 : 0
    }));

    res.json({
      success: true,
      data: {
        link: {
          name: link.name,
          code: link.code,
          clicks: link.clicks,
          conversions: link.conversions,
          revenue: link.revenue
        },
        period,
        summary: {
          totalClicks: clicks.length,
          uniqueClicks: clicks.filter(c => c.isUnique).length,
          totalConversions: conversions.length,
          conversionRate: clicks.length > 0 ? (conversions.length / clicks.length) * 100 : 0,
          averageOrderValue: conversions.length > 0 ? 
            conversions.reduce((sum, c) => sum + (c.conversionId ? 0 : 0), 0) / conversions.length : 0
        },
        dailyBreakdown: dailyData
      }
    });
  } catch (error) {
    console.error('Get link stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching link statistics'
    });
  }
};