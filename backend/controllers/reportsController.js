const Conversion = require('../models/Conversion');
const Click = require('../models/Click');
const Affiliate = require('../models/Affiliate');
const Commission = require('../models/Commission');
const Payout = require('../models/Payout');
const { formatDate, calculatePercentage } = require('../utils/helpers');

// @desc    Generate affiliate report
// @route   GET /api/reports/affiliate
// @access  Private (Affiliate)
exports.getAffiliateReport = async (req, res) => {
  try {
    const { startDate, endDate, format = 'json', groupBy = 'day' } = req.query;
    
    const affiliate = await Affiliate.findOne({ userId: req.user._id });
    
    if (!affiliate) {
      return res.status(404).json({
        success: false,
        message: 'Affiliate profile not found'
      });
    }

    const dateQuery = {};
    if (startDate) dateQuery.$gte = new Date(startDate);
    if (endDate) dateQuery.$lte = new Date(endDate);

    // Fetch data
    const [clicks, conversions, commissions] = await Promise.all([
      Click.find({
        affiliateId: affiliate._id,
        createdAt: dateQuery
      }).sort('createdAt'),
      Conversion.find({
        affiliateId: affiliate._id,
        createdAt: dateQuery,
        status: 'approved'
      }).sort('createdAt'),
      Commission.find({
        affiliateId: affiliate._id,
        createdAt: dateQuery,
        status: { $in: ['approved', 'paid'] }
      }).sort('createdAt')
    ]);

    // Group data by date
    const groupedData = {};
    
    const addToGroup = (date, type, value = 1, amount = 0) => {
      if (!groupedData[date]) {
        groupedData[date] = {
          date,
          clicks: 0,
          uniqueClicks: 0,
          conversions: 0,
          revenue: 0,
          commission: 0
        };
      }
      
      if (type === 'click') {
        groupedData[date].clicks += value;
        if (value.isUnique) groupedData[date].uniqueClicks += 1;
      } else if (type === 'conversion') {
        groupedData[date].conversions += 1;
        groupedData[date].revenue += amount;
        groupedData[date].commission += value;
      }
    };

    // Process clicks
    clicks.forEach(click => {
      const date = formatDate(click.createdAt);
      addToGroup(date, 'click', click, 0);
    });

    // Process conversions
    conversions.forEach(conv => {
      const date = formatDate(conv.createdAt);
      addToGroup(date, 'conversion', conv.commission, conv.amount);
    });

    // Convert to array and sort
    const reportData = Object.values(groupedData).sort((a, b) => a.date.localeCompare(b.date));

    // Calculate summary
    const summary = {
      totalClicks: clicks.length,
      uniqueClicks: clicks.filter(c => c.isUnique).length,
      totalConversions: conversions.length,
      totalRevenue: conversions.reduce((sum, c) => sum + c.amount, 0),
      totalCommission: commissions.reduce((sum, c) => sum + c.amount, 0),
      conversionRate: clicks.length > 0 ? 
        calculatePercentage(conversions.length, clicks.length) : 0,
      averageCommission: conversions.length > 0 ? 
        commissions.reduce((sum, c) => sum + c.amount, 0) / conversions.length : 0,
      averageOrderValue: conversions.length > 0 ? 
        conversions.reduce((sum, c) => sum + c.amount, 0) / conversions.length : 0
    };

    // Generate CSV if requested
    if (format === 'csv') {
      const csvData = generateAffiliateCSV(reportData, summary);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=affiliate-report-${Date.now()}.csv`);
      return res.send(csvData);
    }

    res.json({
      success: true,
      data: {
        period: { startDate, endDate },
        summary,
        breakdown: reportData,
        topPerformingLinks: await getTopLinks(affiliate._id, dateQuery),
        recentConversions: conversions.slice(-10).map(c => ({
          orderId: c.orderId,
          amount: c.amount,
          commission: c.commission,
          date: c.createdAt
        }))
      }
    });
  } catch (error) {
    console.error('Affiliate report error:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating report'
    });
  }
};

// @desc    Generate admin report
// @route   GET /api/reports/admin
// @access  Private (Admin)
exports.getAdminReport = async (req, res) => {
  try {
    const { startDate, endDate, type = 'overview', format = 'json' } = req.query;
    
    const dateQuery = {};
    if (startDate) dateQuery.$gte = new Date(startDate);
    if (endDate) dateQuery.$lte = new Date(endDate);

    let reportData = {};

    switch (type) {
      case 'affiliate-performance':
        reportData = await getAffiliatePerformanceReport(dateQuery);
        break;
      case 'roi-analysis':
        reportData = await getROIAnalysis(dateQuery);
        break;
      case 'conversion-trends':
        reportData = await getConversionTrends(dateQuery);
        break;
      case 'payout-summary':
        reportData = await getPayoutSummary(dateQuery);
        break;
      default:
        reportData = await getOverviewReport(dateQuery);
    }

    if (format === 'csv') {
      const csvData = generateAdminCSV(reportData, type);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=admin-report-${type}-${Date.now()}.csv`);
      return res.send(csvData);
    }

    res.json({
      success: true,
      data: reportData
    });
  } catch (error) {
    console.error('Admin report error:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating report'
    });
  }
};

// @desc    Get real-time stats
// @route   GET /api/reports/realtime
// @access  Private
exports.getRealtimeStats = async (req, res) => {
  try {
    const { role } = req.user;
    const now = new Date();
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const lastHour = new Date(now.getTime() - 60 * 60 * 1000);

    if (role === 'admin') {
      const stats = await getAdminRealtimeStats(last24h, lastHour);
      res.json({ success: true, data: stats });
    } else {
      const affiliate = await Affiliate.findOne({ userId: req.user._id });
      const stats = await getAffiliateRealtimeStats(affiliate._id, last24h, lastHour);
      res.json({ success: true, data: stats });
    }
  } catch (error) {
    console.error('Realtime stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching realtime stats'
    });
  }
};

// Helper functions
async function getOverviewReport(dateQuery) {
  const [
    totalAffiliates,
    activeAffiliates,
    pendingAffiliates,
    totalClicks,
    totalConversions,
    totalCommission,
    totalPayouts
  ] = await Promise.all([
    Affiliate.countDocuments(),
    Affiliate.countDocuments({ 
      lastActive: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } 
    }),
    Affiliate.countDocuments({ status: 'pending' }),
    Click.countDocuments(dateQuery),
    Conversion.countDocuments({ ...dateQuery, status: 'approved' }),
    Commission.aggregate([
      { $match: { ...dateQuery, status: { $in: ['approved', 'paid'] } } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]),
    Payout.aggregate([
      { $match: { ...dateQuery, status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ])
  ]);

  const totalCommissionValue = totalCommission[0]?.total || 0;
  const totalPayoutsValue = totalPayouts[0]?.total || 0;

  return {
    affiliates: {
      total: totalAffiliates,
      active: activeAffiliates,
      pending: pendingAffiliates,
      growth: await getAffiliateGrowth(dateQuery)
    },
    performance: {
      clicks: totalClicks,
      conversions: totalConversions,
      conversionRate: totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0,
      totalCommission: totalCommissionValue,
      totalPayouts: totalPayoutsValue,
      pendingPayouts: await getPendingPayoutsTotal()
    },
    revenue: {
      total: totalCommissionValue,
      paid: totalPayoutsValue,
      pending: totalCommissionValue - totalPayoutsValue
    }
  };
}

async function getAffiliatePerformanceReport(dateQuery) {
  const affiliates = await Affiliate.find()
    .populate('userId', 'name email')
    .sort('-totalEarnings');

  const performance = await Promise.all(affiliates.map(async (aff) => {
    const stats = await Commission.aggregate([
      { $match: { affiliateId: aff._id, ...dateQuery } },
      {
        $group: {
          _id: null,
          totalCommission: { $sum: '$amount' },
          commissionCount: { $sum: 1 }
        }
      }
    ]);

    const conversions = await Conversion.countDocuments({
      affiliateId: aff._id,
      ...dateQuery,
      status: 'approved'
    });

    const clicks = await Click.countDocuments({
      affiliateId: aff._id,
      ...dateQuery
    });

    return {
      affiliate: {
        id: aff._id,
        code: aff.affiliateCode,
        name: aff.userId.name,
        email: aff.userId.email,
        status: aff.status
      },
      metrics: {
        totalEarnings: aff.totalEarnings,
        pendingCommission: aff.pendingCommission,
        totalClicks: clicks,
        totalConversions: conversions,
        conversionRate: clicks > 0 ? (conversions / clicks) * 100 : 0,
        commissionThisPeriod: stats[0]?.totalCommission || 0,
        averageCommission: stats[0]?.commissionCount > 0 ? 
          stats[0].totalCommission / stats[0].commissionCount : 0
      },
      ranking: {
        earningsRank: 0,
        conversionRank: 0
      }
    };
  }));

  // Calculate rankings
  performance.sort((a, b) => b.metrics.totalEarnings - a.metrics.totalEarnings);
  performance.forEach((p, index) => {
    p.ranking.earningsRank = index + 1;
  });

  performance.sort((a, b) => b.metrics.conversionRate - a.metrics.conversionRate);
  performance.forEach((p, index) => {
    p.ranking.conversionRank = index + 1;
  });

  return {
    affiliates: performance,
    summary: {
      totalAffiliates: affiliates.length,
      activeAffiliates: affiliates.filter(a => a.status === 'approved').length,
      totalEarnings: performance.reduce((sum, p) => sum + p.metrics.totalEarnings, 0),
      averageConversionRate: performance.reduce((sum, p) => sum + p.metrics.conversionRate, 0) / performance.length
    }
  };
}

async function getROIAnalysis(dateQuery) {
  const [totalCommission, totalRevenue] = await Promise.all([
    Commission.aggregate([
      { $match: { ...dateQuery, status: 'paid' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]),
    Conversion.aggregate([
      { $match: { ...dateQuery, status: 'approved' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ])
  ]);

  const commissionTotal = totalCommission[0]?.total || 0;
  const revenueTotal = totalRevenue[0]?.total || 0;

  return {
    totalCommission: commissionTotal,
    totalRevenue: revenueTotal,
    roi: commissionTotal > 0 ? 
      ((revenueTotal - commissionTotal) / commissionTotal) * 100 : 0,
    commissionPercentage: revenueTotal > 0 ? 
      (commissionTotal / revenueTotal) * 100 : 0,
    breakEvenPoint: calculateBreakEvenPoint(commissionTotal, revenueTotal),
    monthlyTrends: await getMonthlyROITrends(dateQuery)
  };
}

async function getConversionTrends(dateQuery) {
  const trends = await Conversion.aggregate([
    { $match: { ...dateQuery, status: 'approved' } },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          day: { $dayOfMonth: '$createdAt' }
        },
        conversions: { $sum: 1 },
        revenue: { $sum: '$amount' },
        commission: { $sum: '$commission' }
      }
    },
    { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
  ]);

  return {
    trends: trends.map(t => ({
      date: `${t._id.year}-${String(t._id.month).padStart(2, '0')}-${String(t._id.day).padStart(2, '0')}`,
      conversions: t.conversions,
      revenue: t.revenue,
      commission: t.commission,
      averageOrderValue: t.conversions > 0 ? t.revenue / t.conversions : 0
    })),
    summary: {
      totalConversions: trends.reduce((sum, t) => sum + t.conversions, 0),
      totalRevenue: trends.reduce((sum, t) => sum + t.revenue, 0),
      totalCommission: trends.reduce((sum, t) => sum + t.commission, 0)
    }
  };
}

async function getPayoutSummary(dateQuery) {
  const payouts = await Payout.find(dateQuery)
    .populate('affiliateId', 'affiliateCode')
    .sort('-createdAt');

  const summary = {
    totalRequested: payouts.reduce((sum, p) => sum + p.amount, 0),
    totalProcessed: payouts.filter(p => p.status === 'completed')
      .reduce((sum, p) => sum + p.amount, 0),
    totalPending: payouts.filter(p => p.status === 'pending')
      .reduce((sum, p) => sum + p.amount, 0),
    totalFailed: payouts.filter(p => p.status === 'failed')
      .reduce((sum, p) => sum + p.amount, 0),
    totalTDS: payouts.reduce((sum, p) => sum + (p.tdsAmount || 0), 0)
  };

  return {
    payouts: payouts.map(p => ({
      id: p._id,
      affiliate: p.affiliateId?.affiliateCode,
      amount: p.amount,
      netAmount: p.netAmount,
      method: p.paymentMethod,
      status: p.status,
      transactionId: p.transactionId,
      date: p.createdAt
    })),
    summary,
    byMethod: groupByPaymentMethod(payouts),
    byStatus: groupByStatus(payouts)
  };
}

async function getAffiliateRealtimeStats(affiliateId, last24h, lastHour) {
  const [last24hClicks, last24hConversions, lastHourClicks, lastHourConversions] = await Promise.all([
    Click.countDocuments({ affiliateId, createdAt: { $gte: last24h } }),
    Conversion.countDocuments({ affiliateId, createdAt: { $gte: last24h }, status: 'approved' }),
    Click.countDocuments({ affiliateId, createdAt: { $gte: lastHour } }),
    Conversion.countDocuments({ affiliateId, createdAt: { $gte: lastHour }, status: 'approved' })
  ]);

  return {
    clicks: {
      last24h: last24hClicks,
      lastHour: lastHourClicks,
      trend: calculateTrend(lastHourClicks, last24hClicks / 24)
    },
    conversions: {
      last24h: last24hConversions,
      lastHour: lastHourConversions,
      trend: calculateTrend(lastHourConversions, last24hConversions / 24)
    },
    activeNow: await getActiveNowCount(affiliateId)
  };
}

async function getAdminRealtimeStats(last24h, lastHour) {
  const [
    totalClicks24h,
    totalConversions24h,
    totalClicksHour,
    totalConversionsHour,
    activeAffiliates,
    pendingPayouts
  ] = await Promise.all([
    Click.countDocuments({ createdAt: { $gte: last24h } }),
    Conversion.countDocuments({ createdAt: { $gte: last24h }, status: 'approved' }),
    Click.countDocuments({ createdAt: { $gte: lastHour } }),
    Conversion.countDocuments({ createdAt: { $gte: lastHour }, status: 'approved' }),
    Affiliate.countDocuments({ lastActive: { $gte: lastHour } }),
    Payout.countDocuments({ status: 'pending' })
  ]);

  return {
    global: {
      clicks: {
        last24h: totalClicks24h,
        lastHour: totalClicksHour,
        trend: calculateTrend(totalClicksHour, totalClicks24h / 24)
      },
      conversions: {
        last24h: totalConversions24h,
        lastHour: totalConversionsHour,
        trend: calculateTrend(totalConversionsHour, totalConversions24h / 24)
      },
      conversionRate: totalClicks24h > 0 ? 
        (totalConversions24h / totalClicks24h) * 100 : 0
    },
    affiliates: {
      activeNow: activeAffiliates,
      pendingPayouts
    }
  };
}

// Utility functions
function calculateTrend(current, previous) {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}

async function getTopLinks(affiliateId, dateQuery) {
  return await Link.find({ affiliateId })
    .sort('-clicks')
    .limit(10)
    .select('name clicks conversions revenue');
}

async function getAffiliateGrowth(dateQuery) {
  const lastMonth = new Date();
  lastMonth.setMonth(lastMonth.getMonth() - 1);
  
  const currentMonth = await Affiliate.countDocuments(dateQuery);
  const previousMonth = await Affiliate.countDocuments({ createdAt: { $lt: dateQuery.$gte || new Date(), $gte: lastMonth } });
  
  return previousMonth > 0 ? ((currentMonth - previousMonth) / previousMonth) * 100 : 0;
}

async function getPendingPayoutsTotal() {
  const result = await Payout.aggregate([
    { $match: { status: 'pending' } },
    { $group: { _id: null, total: { $sum: '$amount' } } }
  ]);
  return result[0]?.total || 0;
}

function calculateBreakEvenPoint(commission, revenue) {
  if (commission === 0) return 0;
  return (commission / (revenue - commission)) * 100;
}

async function getMonthlyROITrends(dateQuery) {
  return await Commission.aggregate([
    { $match: { ...dateQuery, status: 'paid' } },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' }
        },
        commission: { $sum: '$amount' }
      }
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } }
  ]);
}

function groupByPaymentMethod(payouts) {
  const grouped = {};
  payouts.forEach(p => {
    if (!grouped[p.paymentMethod]) grouped[p.paymentMethod] = { count: 0, total: 0 };
    grouped[p.paymentMethod].count++;
    grouped[p.paymentMethod].total += p.amount;
  });
  return grouped;
}

function groupByStatus(payouts) {
  const grouped = {};
  payouts.forEach(p => {
    if (!grouped[p.status]) grouped[p.status] = { count: 0, total: 0 };
    grouped[p.status].count++;
    grouped[p.status].total += p.amount;
  });
  return grouped;
}

async function getActiveNowCount(affiliateId) {
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
  return await Click.countDocuments({
    affiliateId,
    createdAt: { $gte: fiveMinutesAgo }
  });
}

function generateAffiliateCSV(breakdown, summary) {
  const rows = [
    ['Report Generated', new Date().toISOString()],
    [],
    ['SUMMARY'],
    ['Metric', 'Value'],
    ['Total Clicks', summary.totalClicks],
    ['Unique Clicks', summary.uniqueClicks],
    ['Total Conversions', summary.totalConversions],
    ['Total Revenue', summary.totalRevenue],
    ['Total Commission', summary.totalCommission],
    ['Conversion Rate', `${summary.conversionRate.toFixed(2)}%`],
    ['Average Order Value', summary.averageOrderValue],
    ['Average Commission', summary.averageCommission],
    [],
    ['DAILY BREAKDOWN'],
    ['Date', 'Clicks', 'Unique Clicks', 'Conversions', 'Revenue', 'Commission']
  ];

  breakdown.forEach(day => {
    rows.push([
      day.date,
      day.clicks,
      day.uniqueClicks,
      day.conversions,
      day.revenue.toFixed(2),
      day.commission.toFixed(2)
    ]);
  });

  return rows.map(row => row.join(',')).join('\n');
}

function generateAdminCSV(data, type) {
  // Implementation depends on report type
  const rows = [['Report Type', type], ['Generated', new Date().toISOString()], []];
  
  if (type === 'affiliate-performance' && data.affiliates) {
    rows.push(['Affiliate Code', 'Name', 'Email', 'Status', 'Total Earnings', 'Pending Commission', 'Clicks', 'Conversions', 'Conversion Rate']);
    data.affiliates.forEach(aff => {
      rows.push([
        aff.affiliate.code,
        aff.affiliate.name,
        aff.affiliate.email,
        aff.affiliate.status,
        aff.metrics.totalEarnings,
        aff.metrics.pendingCommission,
        aff.metrics.totalClicks,
        aff.metrics.totalConversions,
        `${aff.metrics.conversionRate.toFixed(2)}%`
      ]);
    });
  }
  
  return rows.map(row => row.join(',')).join('\n');
}