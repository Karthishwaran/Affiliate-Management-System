const Commission = require('../models/Commission');
const Affiliate = require('../models/Affiliate');
const Conversion = require('../models/Conversion');

class CommissionService {
  // Calculate commission based on type
  static calculateCommission(amount, commissionType, rate) {
    switch (commissionType) {
      case 'flat':
        return rate;
      case 'percentage':
        return (amount * rate) / 100;
      case 'hybrid':
        const { flat, percentage } = rate;
        return flat + (amount * percentage) / 100;
      default:
        return 0;
    }
  }

  // Process commission for conversion
  static async processCommission(conversionId) {
    try {
      const conversion = await Conversion.findById(conversionId)
        .populate('affiliateId')
        .populate('linkId');

      if (!conversion) {
        throw new Error('Conversion not found');
      }

      // Get commission rules based on product or tier
      const commissionRules = await this.getCommissionRules(
        conversion.productId,
        conversion.affiliateId.performanceScore
      );

      // Calculate commission amount
      const commissionAmount = this.calculateCommission(
        conversion.amount,
        commissionRules.type,
        commissionRules.rate
      );

      // Create commission record
      const commission = await Commission.create({
        affiliateId: conversion.affiliateId._id,
        conversionId: conversion._id,
        orderId: conversion.orderId,
        amount: commissionAmount,
        type: commissionRules.type,
        rate: commissionRules.rate,
        tier: commissionRules.tier || 1,
        status: commissionRules.autoApprove ? 'approved' : 'pending'
      });

      // Update affiliate pending commission
      await Affiliate.findByIdAndUpdate(conversion.affiliateId._id, {
        $inc: { pendingCommission: commissionAmount }
      });

      // Update conversion with commission
      conversion.commission = commissionAmount;
      conversion.commissionRate = commissionRules.rate;
      await conversion.save();

      // Auto-approve if configured
      if (commissionRules.autoApprove) {
        await this.approveCommission(commission._id);
      }

      // Handle tier 2 commissions if applicable
      if (commissionRules.tier2Enabled) {
        await this.processTier2Commission(conversion, commissionAmount);
      }

      return { success: true, commission };
    } catch (error) {
      console.error('Process commission error:', error);
      return { success: false, error: error.message };
    }
  }

  // Approve commission
  static async approveCommission(commissionId, approvedBy = null) {
    try {
      const commission = await Commission.findById(commissionId);
      if (!commission) {
        throw new Error('Commission not found');
      }

      if (commission.status !== 'pending') {
        throw new Error(`Commission is already ${commission.status}`);
      }

      commission.status = 'approved';
      commission.approvedAt = new Date();
      if (approvedBy) commission.approvedBy = approvedBy;
      await commission.save();

      // Update affiliate totals
      const affiliate = await Affiliate.findById(commission.affiliateId);
      affiliate.pendingCommission -= commission.amount;
      affiliate.totalEarnings += commission.amount;
      await affiliate.save();

      return { success: true, commission };
    } catch (error) {
      console.error('Approve commission error:', error);
      return { success: false, error: error.message };
    }
  }

  // Process tier 2 commission (referral commissions)
  static async processTier2Commission(conversion, commissionAmount) {
    try {
      const affiliate = await Affiliate.findById(conversion.affiliateId)
        .populate('referredBy');

      if (!affiliate.referredBy) return;

      const tier2Rate = 0.05; // 5% of original commission
      const tier2Commission = commissionAmount * tier2Rate;

      await Commission.create({
        affiliateId: affiliate.referredBy._id,
        conversionId: conversion._id,
        orderId: conversion.orderId,
        amount: tier2Commission,
        type: 'percentage',
        rate: tier2Rate * 100,
        tier: 2,
        parentCommissionId: conversion.commissionId,
        status: 'pending'
      });
    } catch (error) {
      console.error('Tier 2 commission error:', error);
    }
  }

  // Calculate affiliate performance score
  static async calculatePerformanceScore(affiliateId) {
    try {
      const affiliate = await Affiliate.findById(affiliateId);
      if (!affiliate) return 0;

      const ninetyDaysAgo = new Date();
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

      const conversions = await Conversion.find({
        affiliateId,
        createdAt: { $gte: ninetyDaysAgo },
        status: 'approved'
      });

      const totalClicks = affiliate.totalClicks;
      const totalConversions = conversions.length;
      const totalRevenue = conversions.reduce((sum, c) => sum + c.amount, 0);

      // Calculate metrics
      const conversionRate = totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0;
      const averageOrderValue = totalConversions > 0 ? totalRevenue / totalConversions : 0;
      
      // Score components (0-100)
      const clickScore = Math.min((totalClicks / 1000) * 100, 100);
      const conversionRateScore = Math.min(conversionRate * 10, 100);
      const revenueScore = Math.min((totalRevenue / 10000) * 100, 100);
      const aovScore = Math.min((averageOrderValue / 500) * 100, 100);

      // Weighted score
      const performanceScore = (
        clickScore * 0.2 +
        conversionRateScore * 0.3 +
        revenueScore * 0.3 +
        aovScore * 0.2
      );

      // Update affiliate
      affiliate.performanceScore = Math.round(performanceScore);
      affiliate.conversionRate = conversionRate;
      affiliate.averageOrderValue = averageOrderValue;
      await affiliate.save();

      return performanceScore;
    } catch (error) {
      console.error('Calculate performance score error:', error);
      return 0;
    }
  }

  // Get commission rules
  static async getCommissionRules(productId, performanceScore = 0) {
    // Base rules - in production, fetch from database
    let rules = {
      type: 'percentage',
      rate: 10,
      autoApprove: false,
      tier2Enabled: false
    };

    // Performance-based bonuses
    if (performanceScore >= 90) {
      rules.rate = 15;
      rules.autoApprove = true;
    } else if (performanceScore >= 70) {
      rules.rate = 12;
      rules.autoApprove = true;
    }

    // Product-specific rules
    if (productId) {
      // Fetch product-specific commission rates
      // This would come from a Product model
    }

    return rules;
  }

  // Generate commission report
  static async generateCommissionReport(affiliateId, startDate, endDate) {
    try {
      const query = { affiliateId };
      if (startDate) query.createdAt = { $gte: new Date(startDate) };
      if (endDate) query.createdAt = { ...query.createdAt, $lte: new Date(endDate) };

      const commissions = await Commission.find(query)
        .populate('conversionId', 'orderId amount')
        .sort('-createdAt');

      const summary = {
        total: commissions.reduce((sum, c) => sum + c.amount, 0),
        byStatus: {
          pending: commissions.filter(c => c.status === 'pending')
            .reduce((sum, c) => sum + c.amount, 0),
          approved: commissions.filter(c => c.status === 'approved')
            .reduce((sum, c) => sum + c.amount, 0),
          paid: commissions.filter(c => c.status === 'paid')
            .reduce((sum, c) => sum + c.amount, 0)
        },
        byTier: {
          tier1: commissions.filter(c => c.tier === 1)
            .reduce((sum, c) => sum + c.amount, 0),
          tier2: commissions.filter(c => c.tier === 2)
            .reduce((sum, c) => sum + c.amount, 0)
        }
      };

      return { success: true, data: { commissions, summary } };
    } catch (error) {
      console.error('Generate commission report error:', error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = CommissionService;