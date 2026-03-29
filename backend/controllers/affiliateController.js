const Affiliate = require('../models/Affiliate');
const Link = require('../models/Link');
const Click = require('../models/Click');
const Conversion = require('../models/Conversion');
const Commission = require('../models/Commission');
const Payout = require('../models/Payout');
const User = require('../models/User');
const { uploadToCloudinary } = require('../utils/cloudinary');
const { calculatePerformanceScore } = require('../services/commissionService');

// @desc    Get affiliate dashboard stats
// @route   GET /api/affiliate/dashboard/stats
// @access  Private (Affiliate)
exports.getDashboardStats = async (req, res) => {
  try {
    const affiliate = await Affiliate.findOne({ userId: req.user._id });
    
    if (!affiliate) {
      return res.status(404).json({
        success: false,
        message: 'Affiliate profile not found'
      });
    }

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    // Get stats for different periods
    const [monthlyStats, weeklyStats, yearlyStats, totalStats] = await Promise.all([
      // Monthly stats
      Click.aggregate([
        { $match: { affiliateId: affiliate._id, createdAt: { $gte: startOfMonth } } },
        { $group: { _id: null, clicks: { $sum: 1 }, uniqueClicks: { $sum: '$isUnique' } } }
      ]),
      // Weekly stats
      Click.aggregate([
        { $match: { affiliateId: affiliate._id, createdAt: { $gte: startOfWeek } } },
        { $group: { _id: null, clicks: { $sum: 1 } } }
      ]),
      // Yearly stats
      Conversion.aggregate([
        { $match: { affiliateId: affiliate._id, createdAt: { $gte: startOfYear }, status: 'approved' } },
        { $group: { _id: null, revenue: { $sum: '$amount' }, commission: { $sum: '$commission' } } }
      ]),
      // Total stats
      Promise.all([
        Click.countDocuments({ affiliateId: affiliate._id }),
        Conversion.countDocuments({ affiliateId: affiliate._id, status: 'approved' }),
        Commission.aggregate([
          { $match: { affiliateId: affiliate._id, status: 'approved' } },
          { $group: { _id: null, total: { $sum: '$amount' } } }
        ]),
        Commission.aggregate([
          { $match: { affiliateId: affiliate._id, status: 'pending' } },
          { $group: { _id: null, total: { $sum: '$amount' } } }
        ])
      ])
    ]);

    const totalClicks = totalStats[0] || 0;
    const totalConversions = totalStats[1] || 0;
    const totalEarned = totalStats[2]?.[0]?.total || 0;
    const pendingCommission = totalStats[3]?.[0]?.total || 0;

    // Calculate conversion rate
    const conversionRate = totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0;

    // Get recent conversions
    const recentConversions = await Conversion.find({ affiliateId: affiliate._id })
      .sort('-createdAt')
      .limit(10)
      .populate('linkId', 'name');

    // Get top performing links
    const topLinks = await Link.find({ affiliateId: affiliate._id })
      .sort('-clicks')
      .limit(5)
      .select('name clicks conversions revenue');

    res.json({
      success: true,
      data: {
        overview: {
          totalEarnings: affiliate.totalEarnings,
          pendingCommission,
          totalClicks,
          totalConversions,
          conversionRate: conversionRate.toFixed(2),
          averageOrderValue: affiliate.averageOrderValue
        },
        periods: {
          weekly: {
            clicks: weeklyStats[0]?.clicks || 0
          },
          monthly: {
            clicks: monthlyStats[0]?.clicks || 0,
            uniqueClicks: monthlyStats[0]?.uniqueClicks || 0
          },
          yearly: {
            revenue: yearlyStats[0]?.revenue || 0,
            commission: yearlyStats[0]?.commission || 0
          }
        },
        recentConversions,
        topLinks,
        performanceScore: affiliate.performanceScore
      }
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard stats'
    });
  }
};

// @desc    Get affiliate profile
// @route   GET /api/affiliate/profile
// @access  Private (Affiliate)
exports.getProfile = async (req, res) => {
  try {
    const affiliate = await Affiliate.findOne({ userId: req.user._id })
      .populate('userId', 'name email phone');

    if (!affiliate) {
      return res.status(404).json({
        success: false,
        message: 'Affiliate profile not found'
      });
    }

    res.json({
      success: true,
      data: affiliate
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching profile'
    });
  }
};

// @desc    Update affiliate profile
// @route   PUT /api/affiliate/profile
// @access  Private (Affiliate)
exports.updateProfile = async (req, res) => {
  try {
    const {
      website,
      niche,
      promotionMethods,
      audienceSize,
      paymentEmail,
      preferredPaymentMethod,
      bankDetails,
      upiId
    } = req.body;

    const affiliate = await Affiliate.findOne({ userId: req.user._id });

    if (!affiliate) {
      return res.status(404).json({
        success: false,
        message: 'Affiliate profile not found'
      });
    }

    // Update fields
    if (website) affiliate.website = website;
    if (niche) affiliate.niche = niche;
    if (promotionMethods) affiliate.promotionMethods = promotionMethods;
    if (audienceSize) affiliate.audienceSize = audienceSize;
    if (paymentEmail) affiliate.paymentEmail = paymentEmail;
    if (preferredPaymentMethod) affiliate.preferredPaymentMethod = preferredPaymentMethod;
    if (bankDetails) affiliate.bankDetails = bankDetails;
    if (upiId) affiliate.upiId = upiId;

    await affiliate.save();

    res.json({
      success: true,
      data: affiliate,
      message: 'Profile updated successfully'
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating profile'
    });
  }
};

// @desc    Upload KYC document
// @route   POST /api/affiliate/kyc/upload
// @access  Private (Affiliate)
exports.uploadKYC = async (req, res) => {
  try {
    const { documentType, documentNumber } = req.body;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a document'
      });
    }

    // Upload to Cloudinary
    const result = await uploadToCloudinary(req.file.path, 'kyc-documents');

    const affiliate = await Affiliate.findOne({ userId: req.user._id });

    if (!affiliate) {
      return res.status(404).json({
        success: false,
        message: 'Affiliate profile not found'
      });
    }

    // Create KYC record (assuming you have a KYC model)
    const KYC = require('../models/KYC');
    const kyc = await KYC.create({
      affiliateId: affiliate._id,
      documentType,
      documentNumber,
      documentUrl: result.secure_url,
      publicId: result.public_id
    });

    res.json({
      success: true,
      data: kyc,
      message: 'KYC document uploaded successfully'
    });
  } catch (error) {
    console.error('KYC upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading KYC document'
    });
  }
};

// @desc    Get performance metrics
// @route   GET /api/affiliate/performance/metrics
// @access  Private (Affiliate)
exports.getPerformanceMetrics = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const affiliate = await Affiliate.findOne({ userId: req.user._id });
    
    if (!affiliate) {
      return res.status(404).json({
        success: false,
        message: 'Affiliate profile not found'
      });
    }

    const query = {
      affiliateId: affiliate._id,
      createdAt: {}
    };

    if (startDate) query.createdAt.$gte = new Date(startDate);
    if (endDate) query.createdAt.$lte = new Date(endDate);

    // Get daily performance data
    const dailyPerformance = await Click.aggregate([
      { $match: query },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          clicks: { $sum: 1 },
          uniqueClicks: { $sum: "$isUnique" }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Get conversion data
    const conversionData = await Conversion.aggregate([
      { $match: { ...query, status: 'approved' } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          conversions: { $sum: 1 },
          revenue: { $sum: "$amount" },
          commission: { $sum: "$commission" }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Get top products
    const topProducts = await Conversion.aggregate([
      { $match: { affiliateId: affiliate._id, status: 'approved' } },
      {
        $group: {
          _id: "$productId",
          totalSales: { $sum: 1 },
          totalRevenue: { $sum: "$amount" },
          totalCommission: { $sum: "$commission" }
        }
      },
      { $sort: { totalRevenue: -1 } },
      { $limit: 10 }
    ]);

    // Calculate trends
    const currentPeriod = dailyPerformance.slice(-30);
    const previousPeriod = dailyPerformance.slice(-60, -30);

    const trend = {
      clicks: currentPeriod.reduce((sum, d) => sum + d.clicks, 0) - 
               previousPeriod.reduce((sum, d) => sum + d.clicks, 0),
      conversions: conversionData.slice(-30).reduce((sum, d) => sum + d.conversions, 0) -
                   conversionData.slice(-60, -30).reduce((sum, d) => sum + d.conversions, 0),
      revenue: conversionData.slice(-30).reduce((sum, d) => sum + d.revenue, 0) -
               conversionData.slice(-60, -30).reduce((sum, d) => sum + d.revenue, 0)
    };

    res.json({
      success: true,
      data: {
        dailyPerformance,
        conversionData,
        topProducts,
        trends: trend,
        summary: {
          totalClicks: dailyPerformance.reduce((sum, d) => sum + d.clicks, 0),
          totalConversions: conversionData.reduce((sum, d) => sum + d.conversions, 0),
          totalRevenue: conversionData.reduce((sum, d) => sum + d.revenue, 0),
          totalCommission: conversionData.reduce((sum, d) => sum + d.commission, 0),
          averageConversionRate: (conversionData.reduce((sum, d) => sum + d.conversions, 0) / 
                                  dailyPerformance.reduce((sum, d) => sum + d.clicks, 0)) * 100
        }
      }
    });
  } catch (error) {
    console.error('Performance metrics error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching performance metrics'
    });
  }
};