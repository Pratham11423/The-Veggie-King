const express = require('express');
const router  = express.Router();
const { placeOrder, getMyOrders, getOrderById, cancelOrder } = require('../controllers/orderController');
const { protect } = require('../middleware/auth');

router.post('/',              protect, placeOrder);
router.get ('/',              protect, getMyOrders);
router.get ('/:id',           protect, getOrderById);
router.put ('/:id/cancel',    protect, cancelOrder);

module.exports = router;
