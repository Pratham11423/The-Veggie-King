const express = require('express');
const router  = express.Router();
const { getTracking, updateTracking } = require('../controllers/trackingController');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/:order_id',  protect, getTracking);
router.put('/:order_id',  protect, adminOnly, updateTracking);

module.exports = router;
