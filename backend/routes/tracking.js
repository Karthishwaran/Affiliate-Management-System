const express = require('express');
const router = express.Router();
const {
  trackClick,
  registerConversion
} = require('../controllers/trackingController');

// Public tracking endpoints
router.get('/click/:code', trackClick);
router.post('/conversion', registerConversion);

module.exports = router;