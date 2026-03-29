const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  requestPayout,
  getPayoutHistory
} = require('../controllers/payoutController');

router.use(protect);

router.post('/request', requestPayout);
router.get('/', getPayoutHistory);

module.exports = router;