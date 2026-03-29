const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getCommissions,
  getCommissionSummary
} = require('../controllers/commissionController');

router.use(protect);

router.get('/', getCommissions);
router.get('/summary', getCommissionSummary);

module.exports = router;