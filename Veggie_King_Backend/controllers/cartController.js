const db = require('../config/db');

// GET /api/cart
const getCart = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT c.id, c.quantity, m.id AS menu_item_id, m.name, m.price, m.image_url, m.is_veg,
              (c.quantity * m.price) AS subtotal
       FROM cart c
       JOIN menu_items m ON c.menu_item_id = m.id
       WHERE c.user_id = ?`,
      [req.user.id]
    );
    const total = rows.reduce((sum, item) => sum + parseFloat(item.subtotal), 0);
    res.json({ success: true, cart: rows, total: total.toFixed(2) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/cart  — add item or increase qty
const addToCart = async (req, res) => {
  try {
    const { menu_item_id, quantity = 1 } = req.body;
    if (!menu_item_id) return res.status(400).json({ success: false, message: 'menu_item_id required' });

    // Check item exists and is available
    const [items] = await db.query('SELECT id FROM menu_items WHERE id=? AND is_available=1', [menu_item_id]);
    if (!items.length) return res.status(404).json({ success: false, message: 'Item not available' });

    await db.query(
      `INSERT INTO cart (user_id, menu_item_id, quantity)
       VALUES (?,?,?)
       ON DUPLICATE KEY UPDATE quantity = quantity + VALUES(quantity)`,
      [req.user.id, menu_item_id, quantity]
    );
    res.json({ success: true, message: 'Item added to cart' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/cart/:menu_item_id  — set exact quantity
const updateCartItem = async (req, res) => {
  try {
    const { quantity } = req.body;
    if (!quantity || quantity < 1)
      return res.status(400).json({ success: false, message: 'Quantity must be at least 1' });

    await db.query(
      'UPDATE cart SET quantity=? WHERE user_id=? AND menu_item_id=?',
      [quantity, req.user.id, req.params.menu_item_id]
    );
    res.json({ success: true, message: 'Cart updated' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/cart/:menu_item_id
const removeFromCart = async (req, res) => {
  try {
    await db.query('DELETE FROM cart WHERE user_id=? AND menu_item_id=?',
      [req.user.id, req.params.menu_item_id]);
    res.json({ success: true, message: 'Item removed from cart' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/cart
const clearCart = async (req, res) => {
  try {
    await db.query('DELETE FROM cart WHERE user_id=?', [req.user.id]);
    res.json({ success: true, message: 'Cart cleared' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getCart, addToCart, updateCartItem, removeFromCart, clearCart };
