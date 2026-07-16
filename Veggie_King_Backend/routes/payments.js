const express = require('express');
const router  = express.Router();
const { createRazorpayOrder, verifyPayment, confirmCOD, getPaymentHistory } = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');

router.post('/create-order', protect, createRazorpayOrder);
router.post('/verify',       protect, verifyPayment);
router.post('/cod',          protect, confirmCOD);
router.get ('/history',      protect, getPaymentHistory);

module.exports = router;
