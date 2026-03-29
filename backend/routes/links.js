const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  createLink,
  getLinks,
  updateLink,
  deleteLink,
  getLinkStats
} = require('../controllers/linkController');

// All routes require authentication
router.use(protect);

router.post('/create', createLink);
router.get('/', getLinks);
router.put('/:id', updateLink);
router.delete('/:id', deleteLink);
router.get('/:id/stats', getLinkStats);

module.exports = router;