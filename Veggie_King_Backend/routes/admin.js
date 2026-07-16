const express = require('express');
const router  = express.Router();
const { getDashboard, getAllOrders, updateOrderStatus, getAllUsers, getRevenue } = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/auth');

router.use(protect, adminOnly); // All admin routes require auth + admin role

router.get('/dashboard',           getDashboard);
router.get('/orders',              getAllOrders);
router.put('/orders/:id/status',   updateOrderStatus);
router.get('/users',               getAllUsers);
router.get('/revenue',             getRevenue);

module.exports = router;
