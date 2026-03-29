const User = require('../models/User');
const Affiliate = require('../models/Affiliate');
const Conversion = require('../models/Conversion');
const Commission = require('../models/Commission');
const Payout = require('../models/Payout');
const KYC = require('../models/KYC');
const { sendEmail } = require('../services/emailService');

// @desc    Get all affiliates
// @route   GET /api/admin/affiliates
// @access  Private (Admin)
exports.getAllAffiliates = async (req, res) => {
  try {
    const { page = 1, limit = 50, status, search } = req.query;
    
    const query = {};
    
    if (status) query.status = status;
    if (search) {
      const affiliateIds = await Affiliate.find({ 
        $or: [
          { affiliateCode: { $regex: search, $options: 'i' } },
          { website: { $regex: search, $options: 'i' } }
        ]
      }).distinct('_id');
      
      query._id = { $in: affiliateIds };
    }

    const affiliates = await Affiliate.find(query)
      .populate('userId', 'name email phone createdAt')
      .populate('approvedBy', 'name email')
      .sort('-createdAt')
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Affiliate.countDocuments(query);

    // Get additional stats for each affiliate
    const affiliatesWithStats = await Promise.all(affiliates.map(async (affiliate) => {
      const stats = await Commission.aggregate([
        { $match: { affiliateId: affiliate._id } },
        {
          $group: {
            _id: null,
            totalEarnings: { $sum: '$amount' },
            pendingCommission: { 
              $sum: { $cond: [{ $eq: ['$status', 'pending'] }, '$amount', 0] }
            },
            paidCommission: { 
              $sum: { $cond: [{ $eq: ['$status', 'paid'] }, '$amount', 0] }
            }
          }
        }
      ]);

      return {
        ...affiliate.toObject(),
        stats: stats[0] || {
          totalEarnings: 0,
          pendingCommission: 0,
          paidCommission: 0
        }
      };
    }));

    res.json({
      success: true,
      data: {
        affiliates: affiliatesWithStats,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get all affiliates error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching affiliates'
    });
  }
};

// @desc    Approve affiliate
// @route   PUT /api/admin/affiliates/:id/approve
// @access  Private (Admin)
exports.approveAffiliate = async (req, res) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;

    const affiliate = await Affiliate.findById(id).populate('userId');
    
    if (!affiliate) {
      return res.status(404).json({
        success: false,
        message: 'Affiliate not found'
      });
    }

    if (affiliate.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Affiliate is already ${affiliate.status}`
      });
    }

    affiliate.status = 'approved';
    affiliate.approvedAt = new Date();
    affiliate.approvedBy = req.user._id;
    affiliate.notes = notes;
    await affiliate.save();

    // Send approval email
    await sendEmail({
      to: affiliate.userId.email,
      subject: 'Affiliate Application Approved',
      template: 'affiliateApproved',
      data: {
        name: affiliate.userId.name,
        affiliateCode: affiliate.affiliateCode,
        dashboardUrl: `${process.env.CLIENT_URL}/affiliate/dashboard`
      }
    });

    res.json({
      success: true,
      data: affiliate,
      message: 'Affiliate approved successfully'
    });
  } catch (error) {
    console.error('Approve affiliate error:', error);
    res.status(500).json({
      success: false,
      message: 'Error approving affiliate'
    });
  }
};

// @desc    Reject affiliate
// @route   PUT /api/admin/affiliates/:id/reject
// @access  Private (Admin)
exports.rejectAffiliate = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const affiliate = await Affiliate.findById(id).populate('userId');
    
    if (!affiliate) {
      return res.status(404).json({
        success: false,
        message: 'Affiliate not found'
      });
    }

    affiliate.status = 'rejected';
    affiliate.rejectionReason = reason;
    await affiliate.save();

    // Send rejection email
    await sendEmail({
      to: affiliate.userId.email,
      subject: 'Affiliate Application Status',
      template: 'affiliateRejected',
      data: {
        name: affiliate.userId.name,
        reason: reason,
        supportEmail: process.env.SUPPORT_EMAIL
      }
    });

    res.json({
      success: true,
      message: 'Affiliate rejected successfully'
    });
  } catch (error) {
    console.error('Reject affiliate error:', error);
    res.status(500).json({
      success: false,
      message: 'Error rejecting affiliate'
    });
  }
};

// @desc    Get affiliate details
// @route   GET /api/admin/affiliates/:id
// @access  Private (Admin)
exports.getAffiliateDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const affiliate = await Affiliate.findById(id)
      .populate('userId', 'name email phone createdAt')
      .populate('approvedBy', 'name email');

    if (!affiliate) {
      return res.status(404).json({
        success: false,
        message: 'Affiliate not found'
      });
    }

    // Get KYC documents
    const kycDocs = await KYC.find({ affiliateId: affiliate._id });

    // Get commission breakdown
    const commissionBreakdown = await Commission.aggregate([
      { $match: { affiliateId: affiliate._id } },
      {
        $group: {
          _id: '$status',
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);

    // Get conversion trends
    const last30Days = new Date();
    last30Days.setDate(last30Days.getDate() - 30);

    const trends = await Conversion.aggregate([
      { $match: { affiliateId: affiliate._id, createdAt: { $gte: last30Days } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          conversions: { $sum: 1 },
          revenue: { $sum: "$amount" }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      success: true,
      data: {
        affiliate,
        kycDocuments: kycDocs,
        commissionBreakdown,
        trends,
        recentConversions: await Conversion.find({ affiliateId: affiliate._id })
          .sort('-createdAt')
          .limit(10)
      }
    });
  } catch (error) {
    console.error('Get affiliate details error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching affiliate details'
    });
  }
};

// @desc    Get admin dashboard stats
// @route   GET /api/admin/dashboard/stats
// @access  Private (Admin)
exports.getDashboardStats = async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));

    const [
      totalAffiliates,
      pendingAffiliates,
      totalConversions,
      totalCommission,
      totalPaid,
      monthlyStats,
      recentActivities
    ] = await Promise.all([
      Affiliate.countDocuments(),
      Affiliate.countDocuments({ status: 'pending' }),
      Conversion.countDocuments(),
      Commission.aggregate([
        { $match: { status: 'approved' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      Payout.aggregate([
        { $match: { status: 'completed' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      Conversion.aggregate([
        { $match: { createdAt: { $gte: startOfMonth } } },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            conversions: { $sum: 1 },
            revenue: { $sum: "$amount" }
          }
        },
        { $sort: { _id: 1 } }
      ]),
      Payout.find({ status: 'pending' })
        .sort('-createdAt')
        .limit(10)
        .populate('affiliateId', 'affiliateCode')
    ]);

    res.json({
      success: true,
      data: {
        overview: {
          totalAffiliates,
          pendingAffiliates,
          totalConversions,
          totalCommission: totalCommission[0]?.total || 0,
          totalPaid: totalPaid[0]?.total || 0,
          conversionRate: totalConversions > 0 ? 
            (totalConversions / (await Click.countDocuments())) * 100 : 0
        },
        monthlyTrends: monthlyStats,
        recentPayoutRequests: recentActivities,
        topAffiliates: await Affiliate.find()
          .sort('-totalEarnings')
          .limit(10)
          .populate('userId', 'name')
      }
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard stats'
    });
  }
};