const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getAllAffiliates,
  approveAffiliate,
  rejectAffiliate,
  getAffiliateDetails,
  getDashboardStats
} = require('../controllers/adminController');
const {
  getAllPayouts,
  processPayout
} = require('../controllers/payoutController');
const {
  updateCommissionStatus
} = require('../controllers/commissionController');

// All admin routes require admin role
router.use(protect, authorize('admin'));

// Affiliate management
router.get('/affiliates', getAllAffiliates);
router.get('/affiliates/:id', getAffiliateDetails);
router.put('/affiliates/:id/approve', approveAffiliate);
router.put('/affiliates/:id/reject', rejectAffiliate);

// Payout management
router.get('/payouts', getAllPayouts);
router.post('/payouts/:id/process', processPayout);

// Commission management
router.put('/commissions/:id/status', updateCommissionStatus);

// Dashboard
router.get('/dashboard/stats', getDashboardStats);

module.exports = router;