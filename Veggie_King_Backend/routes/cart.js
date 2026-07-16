// routes/cart.js
const express = require('express');
const router  = express.Router();
const { getCart, addToCart, updateCartItem, removeFromCart, clearCart } = require('../controllers/cartController');
const { protect } = require('../middleware/auth');

router.get   ('/',                       protect, getCart);
router.post  ('/',                       protect, addToCart);
router.put   ('/:menu_item_id',          protect, updateCartItem);
router.delete('/:menu_item_id',          protect, removeFromCart);
router.delete('/',                       protect, clearCart);

module.exports = router;
