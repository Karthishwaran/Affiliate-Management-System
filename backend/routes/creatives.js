const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');
const {
  getCreatives,
  createCreative,
  updateCreative,
  deleteCreative,
  getCreativeCode
} = require('../controllers/creativeController');

router.use(protect);

router.get('/', getCreatives);
router.post('/', upload.single('image'), createCreative);
router.put('/:id', updateCreative);
router.delete('/:id', deleteCreative);
router.get('/:id/code', getCreativeCode);

module.exports = router;