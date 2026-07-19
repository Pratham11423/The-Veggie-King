const db = require('../config/db');

// GET /api/menu  — all available items (optionally filter by category)
const getMenu = async (req, res) => {
  try {
    const { category_id, veg_only } = req.query;
    let sql = `
      SELECT m.*, c.name AS category_name
      FROM menu_items m
      LEFT JOIN categories c ON m.category_id = c.id
      WHERE m.is_available = 1
    `;
    const params = [];
    if (category_id) { sql += ' AND m.category_id = ?'; params.push(category_id); }
    if (veg_only === 'true') { sql += ' AND m.is_veg = 1'; }
    sql += ' ORDER BY c.name, m.name';

    const [rows] = await db.query(sql, params);
    res.json({ success: true, items: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/menu/categories
const getCategories = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM categories ORDER BY name');
    res.json({ success: true, categories: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/menu/:id
const getMenuItem = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT m.*, c.name AS category_name FROM menu_items m LEFT JOIN categories c ON m.category_id=c.id WHERE m.id=?',
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ success: false, message: 'Item not found' });
    res.json({ success: true, item: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/menu  (admin only)
const createMenuItem = async (req, res) => {
  try {
    const { category_id, name, description, price, image_url, is_veg } = req.body;
    if (!name || !price) return res.status(400).json({ success: false, message: 'Name and price required' });

    const [result] = await db.query(
      'INSERT INTO menu_items (category_id,name,description,price,image_url,is_veg) VALUES (?,?,?,?,?,?)',
      [category_id, name, description, price, image_url, is_veg ?? 1]
    );
    res.status(201).json({ success: true, message: 'Menu item created', id: result.insertId });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/menu/:id  (admin only)
const updateMenuItem = async (req, res) => {
  try {
    const { category_id, name, description, price, image_url, is_veg, is_available } = req.body;
    await db.query(
      'UPDATE menu_items SET category_id=?,name=?,description=?,price=?,image_url=?,is_veg=?,is_available=? WHERE id=?',
      [category_id, name, description, price, image_url, is_veg, is_available, req.params.id]
    );
    res.json({ success: true, message: 'Menu item updated' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/menu/:id  (admin only)
const deleteMenuItem = async (req, res) => {
  try {
    await db.query('DELETE FROM menu_items WHERE id=?', [req.params.id]);
    res.json({ success: true, message: 'Menu item deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getMenu, getCategories, getMenuItem, createMenuItem, updateMenuItem, deleteMenuItem };
