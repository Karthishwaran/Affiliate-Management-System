const Payout = require('../models/Payout');
const Commission = require('../models/Commission');
const Affiliate = require('../models/Affiliate');
const { processPayment } = require('../services/paymentService');

// @desc    Request payout
// @route   POST /api/payouts/request
// @access  Private (Affiliate)
exports.requestPayout = async (req, res) => {
  try {
    const { amount, paymentMethod, paymentDetails } = req.body;
    
    const affiliate = await Affiliate.findOne({ userId: req.user._id });
    
    if (!affiliate) {
      return res.status(404).json({
        success: false,
        message: 'Affiliate profile not found'
      });
    }

    // Check minimum payout threshold
    const minPayout = process.env.MIN_PAYOUT_AMOUNT || 50;
    if (amount < minPayout) {
      return res.status(400).json({
        success: false,
        message: `Minimum payout amount is $${minPayout}`
      });
    }

    // Check available balance
    if (affiliate.pendingCommission < amount) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient balance'
      });
    }

    // Calculate TDS (Tax Deduction at Source)
    const tdsRate = process.env.TDS_RATE || 10;
    const tdsAmount = (amount * tdsRate) / 100;
    const netAmount = amount - tdsAmount;

    // Get pending commissions to include
    const pendingCommissions = await Commission.find({
      affiliateId: affiliate._id,
      status: 'pending'
    }).sort('createdAt').limit(100);

    const commissionIds = pendingCommissions.map(c => c._id);
    const totalCommissionAmount = pendingCommissions.reduce((sum, c) => sum + c.amount, 0);

    // Create payout request
    const payout = await Payout.create({
      affiliateId: affiliate._id,
      amount,
      commissionIds,
      paymentMethod,
      paymentDetails: paymentDetails || {
        paypalEmail: affiliate.paymentEmail,
        bankDetails: affiliate.bankDetails,
        upiId: affiliate.upiId
      },
      tdsAmount,
      netAmount,
      status: 'pending'
    });

    res.status(201).json({
      success: true,
      data: payout,
      message: 'Payout request submitted successfully'
    });
  } catch (error) {
    console.error('Request payout error:', error);
    res.status(500).json({
      success: false,
      message: 'Error requesting payout'
    });
  }
};

// @desc    Get payout history
// @route   GET /api/payouts
// @access  Private (Affiliate)
exports.getPayoutHistory = async (req, res) => {
  try {
    const { page = 1, limit = 50, status } = req.query;
    
    const affiliate = await Affiliate.findOne({ userId: req.user._id });
    
    if (!affiliate) {
      return res.status(404).json({
        success: false,
        message: 'Affiliate profile not found'
      });
    }

    const query = { affiliateId: affiliate._id };
    if (status) query.status = status;

    const payouts = await Payout.find(query)
      .sort('-createdAt')
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Payout.countDocuments(query);

    // Calculate totals
    const totals = await Payout.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          totalRequested: { $sum: '$amount' },
          totalPaid: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, '$amount', 0] } },
          totalPending: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, '$amount', 0] } }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        payouts,
        totals: totals[0] || {
          totalRequested: 0,
          totalPaid: 0,
          totalPending: 0
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
    console.error('Get payout history error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching payout history'
    });
  }
};

// @desc    Admin: Get all payouts
// @route   GET /api/admin/payouts
// @access  Private (Admin)
exports.getAllPayouts = async (req, res) => {
  try {
    const { page = 1, limit = 50, status, affiliateId, startDate, endDate } = req.query;
    
    const query = {};
    
    if (status) query.status = status;
    if (affiliateId) query.affiliateId = affiliateId;
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const payouts = await Payout.find(query)
      .populate('affiliateId', 'affiliateCode paymentEmail')
      .populate('processedBy', 'name email')
      .sort('-createdAt')
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Payout.countDocuments(query);

    res.json({
      success: true,
      data: {
        payouts,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get all payouts error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching payouts'
    });
  }
};

// @desc    Admin: Process payout
// @route   POST /api/admin/payouts/:id/process
// @access  Private (Admin)
exports.processPayout = async (req, res) => {
  try {
    const { id } = req.params;
    
    const payout = await Payout.findById(id).populate('affiliateId');
    
    if (!payout) {
      return res.status(404).json({
        success: false,
        message: 'Payout not found'
      });
    }

    if (payout.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Payout is already ${payout.status}`
      });
    }

    // Process payment through payment gateway
    const paymentResult = await processPayment({
      method: payout.paymentMethod,
      amount: payout.netAmount,
      details: payout.paymentDetails,
      payoutId: payout._id
    });

    if (!paymentResult.success) {
      payout.status = 'failed';
      payout.failureReason = paymentResult.error;
      await payout.save();
      
      return res.status(400).json({
        success: false,
        message: 'Payment processing failed',
        error: paymentResult.error
      });
    }

    // Update payout
    payout.status = 'completed';
    payout.transactionId = paymentResult.transactionId;
    payout.processedAt = new Date();
    payout.processedBy = req.user._id;
    await payout.save();

    // Update commissions to paid
    await Commission.updateMany(
      { _id: { $in: payout.commissionIds } },
      { 
        $set: { 
          status: 'paid',
          paymentId: payout._id
        }
      }
    );

    // Update affiliate totals
    const affiliate = await Affiliate.findById(payout.affiliateId);
    affiliate.pendingCommission -= payout.amount;
    affiliate.paidCommission += payout.amount;
    await affiliate.save();

    res.json({
      success: true,
      data: payout,
      message: 'Payout processed successfully'
    });
  } catch (error) {
    console.error('Process payout error:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing payout'
    });
  }
};