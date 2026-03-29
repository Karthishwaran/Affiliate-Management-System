const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');
const {
  getDashboardStats,
  getProfile,
  updateProfile,
  uploadKYC,
  getPerformanceMetrics
} = require('../controllers/affiliateController');

// All routes require authentication
router.use(protect);

router.get('/dashboard/stats', getDashboardStats);
router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.post('/kyc/upload', upload.single('document'), uploadKYC);
router.get('/performance/metrics', getPerformanceMetrics);

module.exports = router;