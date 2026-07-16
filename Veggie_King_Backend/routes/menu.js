const express = require('express');
const router  = express.Router();
const { getMenu, getCategories, getMenuItem, createMenuItem, updateMenuItem, deleteMenuItem } = require('../controllers/menuController');
const { protect, adminOnly } = require('../middleware/auth');

router.get ('/',             getMenu);
router.get ('/categories',   getCategories);
router.get ('/:id',          getMenuItem);
router.post('/',             protect, adminOnly, createMenuItem);
router.put ('/:id',          protect, adminOnly, updateMenuItem);
router.delete('/:id',        protect, adminOnly, deleteMenuItem);

module.exports = router;
