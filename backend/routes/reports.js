// const express = require('express');
// const router = express.Router();
// const { protect } = require('../middleware/auth');
// const Conversion = require('../models/Conversion');
// const Click = require('../models/Click');
// const Affiliate = require('../models/Affiliate');
// const Commission = require('../models/Commission');

// // @desc    Generate affiliate report
// // @route   GET /api/reports/affiliate
// // @access  Private (Affiliate)
// router.get('/affiliate', protect, async (req, res) => {
//   try {
//     const { startDate, endDate, format = 'json' } = req.query;
    
//     const affiliate = await Affiliate.findOne({ userId: req.user._id });
    
//     const dateQuery = {};
//     if (startDate) dateQuery.$gte = new Date(startDate);
//     if (endDate) dateQuery.$lte = new Date(endDate);

//     const [clicks, conversions, commissions] = await Promise.all([
//       Click.find({
//         affiliateId: affiliate._id,
//         createdAt: dateQuery
//       }),
//       Conversion.find({
//         affiliateId: affiliate._id,
//         createdAt: dateQuery,
//         status: 'approved'
//       }),
//       Commission.find({
//         affiliateId: affiliate._id,
//         createdAt: dateQuery,
//         status: { $in: ['approved', 'paid'] }
//       })
//     ]);

//     const reportData = {
//       period: {
//         startDate: startDate || 'All time',
//         endDate: endDate || 'Present'
//       },
//       summary: {
//         totalClicks: clicks.length,
//         uniqueClicks: clicks.filter(c => c.isUnique).length,
//         totalConversions: conversions.length,
//         conversionRate: clicks.length > 0 ? 
//           (conversions.length / clicks.length) * 100 : 0,
//         totalCommission: commissions.reduce((sum, c) => sum + c.amount, 0),
//         totalRevenue: conversions.reduce((sum, c) => sum + c.amount, 0)
//       },
//       dailyBreakdown: {},
//       conversions: conversions.map(c => ({
//         date: c.createdAt,
//         orderId: c.orderId,
//         amount: c.amount,
//         commission: c.commission,
//         status: c.status
//       }))
//     };

//     // Group by date
//     clicks.forEach(click => {
//       const date = click.createdAt.toISOString().split('T')[0];
//       if (!reportData.dailyBreakdown[date]) {
//         reportData.dailyBreakdown[date] = { clicks: 0, conversions: 0 };
//       }
//       reportData.dailyBreakdown[date].clicks++;
//     });

//     conversions.forEach(conv => {
//       const date = conv.createdAt.toISOString().split('T')[0];
//       if (reportData.dailyBreakdown[date]) {
//         reportData.dailyBreakdown[date].conversions++;
//       }
//     });

//     if (format === 'csv') {
//       // Generate CSV
//       const csv = generateCSV(reportData);
//       res.setHeader('Content-Type', 'text/csv');
//       res.setHeader('Content-Disposition', 'attachment; filename=affiliate-report.csv');
//       return res.send(csv);
//     }

//     res.json({
//       success: true,
//       data: reportData
//     });
//   } catch (error) {
//     console.error('Generate report error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Error generating report'
//     });
//   }
// });

// // @desc    Generate admin report
// // @route   GET /api/reports/admin
// // @access  Private (Admin)
// router.get('/admin', protect, async (req, res) => {
//   try {
//     const { startDate, endDate, type = 'overview' } = req.query;
    
//     const dateQuery = {};
//     if (startDate) dateQuery.$gte = new Date(startDate);
//     if (endDate) dateQuery.$lte = new Date(endDate);

//     switch (type) {
//       case 'affiliate-performance':
//         const affiliates = await Affiliate.find()
//           .populate('userId', 'name email')
//           .sort('-totalEarnings');
        
//         const performanceData = await Promise.all(affiliates.map(async (aff) => {
//           const stats = await Commission.aggregate([
//             { $match: { affiliateId: aff._id, createdAt: dateQuery } },
//             {
//               $group: {
//                 _id: null,
//                 total: { $sum: '$amount' },
//                 count: { $sum: 1 }
//               }
//             }
//           ]);
          
//           return {
//             affiliate: {
//               id: aff._id,
//               code: aff.affiliateCode,
//               name: aff.userId.name,
//               email: aff.userId.email
//             },
//             stats: stats[0] || { total: 0, count: 0 },
//             totalClicks: aff.totalClicks,
//             totalConversions: aff.totalConversions,
//             conversionRate: aff.conversionRate
//           };
//         }));
        
//         return res.json({
//           success: true,
//           data: performanceData
//         });
        
//       case 'roi-analysis':
//         const totalCommissions = await Commission.aggregate([
//           { $match: { createdAt: dateQuery, status: 'paid' } },
//           { $group: { _id: null, total: { $sum: '$amount' } } }
//         ]);
        
//         const totalRevenue = await Conversion.aggregate([
//           { $match: { createdAt: dateQuery, status: 'approved' } },
//           { $group: { _id: null, total: { $sum: '$amount' } } }
//         ]);
        
//         const commissionTotal = totalCommissions[0]?.total || 0;
//         const revenueTotal = totalRevenue[0]?.total || 0;
        
//         return res.json({
//           success: true,
//           data: {
//             totalCommission: commissionTotal,
//             totalRevenue: revenueTotal,
//             roi: commissionTotal > 0 ? 
//               ((revenueTotal - commissionTotal) / commissionTotal) * 100 : 0,
//             commissionPercentage: revenueTotal > 0 ? 
//               (commissionTotal / revenueTotal) * 100 : 0
//           }
//         });
        
//       default:
//         // Overview report
//         const [totalAffiliates, activeAffiliates, totalClicks, totalConversions, totalPayouts] = 
//           await Promise.all([
//             Affiliate.countDocuments(),
//             Affiliate.countDocuments({ status: 'approved', lastActive: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } }),
//             Click.countDocuments(dateQuery),
//             Conversion.countDocuments({ ...dateQuery, status: 'approved' }),
//             Payout.aggregate([
//               { $match: { createdAt: dateQuery, status: 'completed' } },
//               { $group: { _id: null, total: { $sum: '$amount' } } }
//             ])
//           ]);
        
//         res.json({
//           success: true,
//           data: {
//             overview: {
//               totalAffiliates,
//               activeAffiliates,
//               totalClicks,
//               totalConversions,
//               totalPayouts: totalPayouts[0]?.total || 0,
//               conversionRate: totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0
//             },
//             dateRange: { startDate, endDate }
//           }
//         });
//     }
//   } catch (error) {
//     console.error('Admin report error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Error generating report'
//     });
//   }
// });

// // Helper function to generate CSV
// function generateCSV(data) {
//   const rows = [
//     ['Date', 'Clicks', 'Conversions', 'Revenue', 'Commission']
//   ];
  
//   Object.entries(data.dailyBreakdown).forEach(([date, stats]) => {
//     const dayData = data.conversions.filter(c => 
//       new Date(c.date).toISOString().split('T')[0] === date
//     );
//     const revenue = dayData.reduce((sum, c) => sum + c.amount, 0);
//     const commission = dayData.reduce((sum, c) => sum + c.commission, 0);
    
//     rows.push([date, stats.clicks, stats.conversions, revenue, commission]);
//   });
  
//   return rows.map(row => row.join(',')).join('\n');
// }

// module.exports = router;

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getAffiliateReport,
  getAdminReport,
  getRealtimeStats
} = require('../controllers/reportsController');

// All routes require authentication
router.use(protect);

// Affiliate reports
router.get('/affiliate', getAffiliateReport);

// Admin reports
router.get('/admin', getAdminReport);

// Realtime stats
router.get('/realtime', getRealtimeStats);

module.exports = router;