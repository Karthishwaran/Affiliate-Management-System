const Commission = require('../models/Commission');
const Affiliate = require('../models/Affiliate');
const Conversion = require('../models/Conversion');
const { calculatePerformanceScore } = require('../services/commissionService');

// @desc    Get affiliate commissions
// @route   GET /api/commissions
// @access  Private (Affiliate)
exports.getCommissions = async (req, res) => {
  try {
    const { page = 1, limit = 50, status, startDate, endDate } = req.query;
    
    const affiliate = await Affiliate.findOne({ userId: req.user._id });
    
    if (!affiliate) {
      return res.status(404).json({
        success: false,
        message: 'Affiliate profile not found'
      });
    }

    const query = { affiliateId: affiliate._id };
    
    if (status) query.status = status;
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const commissions = await Commission.find(query)
      .populate('conversionId', 'orderId amount')
      .sort('-createdAt')
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Commission.countDocuments(query);

    // Calculate totals
    const totals = await Commission.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$amount' },
          pendingAmount: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, '$amount', 0] } },
          approvedAmount: { $sum: { $cond: [{ $eq: ['$status', 'approved'] }, '$amount', 0] } },
          paidAmount: { $sum: { $cond: [{ $eq: ['$status', 'paid'] }, '$amount', 0] } }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        commissions,
        totals: totals[0] || {
          totalAmount: 0,
          pendingAmount: 0,
          approvedAmount: 0,
          paidAmount: 0
        },
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get commissions error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching commissions'
    });
  }
};

// @desc    Get commission summary
// @route   GET /api/commissions/summary
// @access  Private (Affiliate)
exports.getCommissionSummary = async (req, res) => {
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
    const startOfQuarter = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    const [monthly, quarterly, yearly, byStatus] = await Promise.all([
      Commission.aggregate([
        { $match: { affiliateId: affiliate._id, createdAt: { $gte: startOfMonth } } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      Commission.aggregate([
        { $match: { affiliateId: affiliate._id, createdAt: { $gte: startOfQuarter } } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      Commission.aggregate([
        { $match: { affiliateId: affiliate._id, createdAt: { $gte: startOfYear } } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      Commission.aggregate([
        { $match: { affiliateId: affiliate._id } },
        { $group: { _id: '$status', total: { $sum: '$amount' }, count: { $sum: 1 } } }
      ])
    ]);

    res.json({
      success: true,
      data: {
        monthly: monthly[0]?.total || 0,
        quarterly: quarterly[0]?.total || 0,
        yearly: yearly[0]?.total || 0,
        byStatus: byStatus.reduce((acc, curr) => {
          acc[curr._id] = { amount: curr.total, count: curr.count };
          return acc;
        }, {}),
        pending: affiliate.pendingCommission,
        paid: affiliate.paidCommission,
        total: affiliate.totalEarnings
      }
    });
  } catch (error) {
    console.error('Get commission summary error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching commission summary'
    });
  }
};

// @desc    Admin: Update commission status
// @route   PUT /api/admin/commissions/:id/status
// @access  Private (Admin)
exports.updateCommissionStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    const commission = await Commission.findById(id);
    
    if (!commission) {
      return res.status(404).json({
        success: false,
        message: 'Commission not found'
      });
    }

    const oldStatus = commission.status;
    commission.status = status;
    if (notes) commission.notes = notes;
    if (status === 'approved') commission.approvedAt = new Date();
    
    await commission.save();

    // Update affiliate totals
    const affiliate = await Affiliate.findById(commission.affiliateId);
    
    if (oldStatus === 'pending' && status === 'approved') {
      affiliate.pendingCommission -= commission.amount;
      affiliate.totalEarnings += commission.amount;
    } else if (oldStatus === 'approved' && status === 'pending') {
      affiliate.pendingCommission += commission.amount;
      affiliate.totalEarnings -= commission.amount;
    }
    
    await affiliate.save();

    res.json({
      success: true,
      data: commission,
      message: 'Commission status updated'
    });
  } catch (error) {
    console.error('Update commission status error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating commission status'
    });
  }
};