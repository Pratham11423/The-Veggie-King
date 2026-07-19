const db = require('../config/db');

// GET /api/admin/dashboard  — stats overview
const getDashboard = async (req, res) => {
  try {
    const [[{ total_orders }]]      = await db.query('SELECT COUNT(*) AS total_orders FROM orders');
    const [[{ total_revenue }]]     = await db.query("SELECT COALESCE(SUM(final_amount),0) AS total_revenue FROM orders WHERE payment_status='paid'");
    const [[{ total_users }]]       = await db.query("SELECT COUNT(*) AS total_users FROM users WHERE role='customer'");
    const [[{ pending_orders }]]    = await db.query("SELECT COUNT(*) AS pending_orders FROM orders WHERE status IN ('pending','confirmed','preparing')");
    const [[{ active_offers }]]     = await db.query("SELECT COUNT(*) AS active_offers FROM offers WHERE is_active=1 AND end_date >= CURDATE()");
    const [[{ total_menu_items }]]  = await db.query('SELECT COUNT(*) AS total_menu_items FROM menu_items WHERE is_available=1');

    const [recent_orders] = await db.query(
      `SELECT o.id, o.final_amount, o.status, o.payment_method, o.created_at,
              u.name AS customer_name, u.email AS customer_email
       FROM orders o JOIN users u ON o.user_id=u.id
       ORDER BY o.created_at DESC LIMIT 10`
    );

    res.json({
      success: true,
      stats: { total_orders, total_revenue, total_users, pending_orders, active_offers, total_menu_items },
      recent_orders
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/admin/orders  — all orders with filters
const getAllOrders = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    let sql = `
      SELECT o.*, u.name AS customer_name, u.phone AS customer_phone,
             dt.status AS tracking_status
      FROM orders o
      JOIN users u ON o.user_id=u.id
      LEFT JOIN delivery_tracking dt ON o.id=dt.order_id
    `;
    const params = [];
    if (status) { sql += ' WHERE o.status=?'; params.push(status); }
    sql += ' ORDER BY o.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const [orders] = await db.query(sql, params);
    const [[{ total }]] = await db.query('SELECT COUNT(*) AS total FROM orders' + (status ? ' WHERE status=?' : ''), status ? [status] : []);

    res.json({ success: true, orders, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/admin/orders/:id/status
const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending','confirmed','preparing','out_for_delivery','delivered','cancelled'];
    if (!validStatuses.includes(status))
      return res.status(400).json({ success: false, message: 'Invalid status' });

    await db.query('UPDATE orders SET status=? WHERE id=?', [status, req.params.id]);
    res.json({ success: true, message: `Order status updated to: ${status}` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/admin/users
const getAllUsers = async (req, res) => {
  try {
    const [users] = await db.query(
      "SELECT id, name, email, phone, address, role, created_at FROM users WHERE role='customer' ORDER BY created_at DESC"
    );
    res.json({ success: true, users });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/admin/revenue  — daily revenue for last 30 days
const getRevenue = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT DATE(created_at) AS date, COUNT(*) AS orders, SUM(final_amount) AS revenue
       FROM orders WHERE payment_status='paid' AND created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
       GROUP BY DATE(created_at) ORDER BY date ASC`
    );
    res.json({ success: true, revenue: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getDashboard, getAllOrders, updateOrderStatus, getAllUsers, getRevenue };
