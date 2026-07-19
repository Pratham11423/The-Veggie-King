const db = require('../config/db');

// POST /api/orders  — place order from cart
const placeOrder = async (req, res) => {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    const { delivery_address, payment_method = 'cod', offer_code, notes } = req.body;
    if (!delivery_address) return res.status(400).json({ success: false, message: 'Delivery address required' });

    // Fetch cart
    const [cartItems] = await conn.query(
      `SELECT c.quantity, m.id AS menu_item_id, m.price, m.name
       FROM cart c JOIN menu_items m ON c.menu_item_id=m.id
       WHERE c.user_id=? AND m.is_available=1`,
      [req.user.id]
    );
    if (!cartItems.length) return res.status(400).json({ success: false, message: 'Cart is empty' });

    let total = cartItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
    let discount = 0;
    let offer_id = null;

    // Apply offer code if provided
    if (offer_code) {
      const today = new Date().toISOString().slice(0, 10);
      const [offers] = await conn.query(
        `SELECT * FROM offers WHERE code=? AND is_active=1 AND start_date<=? AND end_date>=?`,
        [offer_code, today, today]
      );
      if (offers.length) {
        const offer = offers[0];
        if (total >= offer.min_order) {
          discount = offer.discount_type === 'percentage'
            ? Math.min((total * offer.discount_value) / 100, offer.max_discount || Infinity)
            : offer.discount_value;
          offer_id = offer.id;
        }
      }
    }

    const final = Math.max(0, total - discount);

    // Create order
    const [orderResult] = await conn.query(
      `INSERT INTO orders (user_id, total_amount, discount_amount, final_amount, offer_id, payment_method, delivery_address, notes)
       VALUES (?,?,?,?,?,?,?,?)`,
      [req.user.id, total, discount, final, offer_id, payment_method, delivery_address, notes]
    );
    const orderId = orderResult.insertId;

    // Insert order items
    for (const item of cartItems) {
      await conn.query(
        'INSERT INTO order_items (order_id, menu_item_id, quantity, price) VALUES (?,?,?,?)',
        [orderId, item.menu_item_id, item.quantity, item.price]
      );
    }

    // Create tracking record
    await conn.query(
      'INSERT INTO delivery_tracking (order_id, status) VALUES (?, ?)',
      [orderId, 'order_placed']
    );

    // Clear cart
    await conn.query('DELETE FROM cart WHERE user_id=?', [req.user.id]);

    await conn.commit();
    res.status(201).json({
      success: true,
      message: 'Order placed successfully!',
      order: { id: orderId, total_amount: total, discount_amount: discount, final_amount: final, payment_method }
    });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ success: false, message: err.message });
  } finally {
    conn.release();
  }
};

// GET /api/orders  — my orders
const getMyOrders = async (req, res) => {
  try {
    const [orders] = await db.query(
      `SELECT o.*, dt.status AS tracking_status
       FROM orders o
       LEFT JOIN delivery_tracking dt ON o.id = dt.order_id
       WHERE o.user_id=? ORDER BY o.created_at DESC`,
      [req.user.id]
    );

    // Attach items to each order
    for (const order of orders) {
      const [items] = await db.query(
        `SELECT oi.quantity, oi.price, m.name, m.image_url
         FROM order_items oi JOIN menu_items m ON oi.menu_item_id=m.id
         WHERE oi.order_id=?`,
        [order.id]
      );
      order.items = items;
    }

    res.json({ success: true, orders });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/orders/:id
const getOrderById = async (req, res) => {
  try {
    const [orders] = await db.query(
      `SELECT o.*, dt.status AS tracking_status, dt.rider_name, dt.rider_phone, dt.eta_minutes
       FROM orders o
       LEFT JOIN delivery_tracking dt ON o.id=dt.order_id
       WHERE o.id=? AND o.user_id=?`,
      [req.params.id, req.user.id]
    );
    if (!orders.length) return res.status(404).json({ success: false, message: 'Order not found' });

    const [items] = await db.query(
      `SELECT oi.quantity, oi.price, m.name, m.image_url
       FROM order_items oi JOIN menu_items m ON oi.menu_item_id=m.id
       WHERE oi.order_id=?`,
      [req.params.id]
    );
    res.json({ success: true, order: { ...orders[0], items } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/orders/:id/cancel
const cancelOrder = async (req, res) => {
  try {
    const [orders] = await db.query(
      'SELECT status FROM orders WHERE id=? AND user_id=?',
      [req.params.id, req.user.id]
    );
    if (!orders.length) return res.status(404).json({ success: false, message: 'Order not found' });
    if (!['pending', 'confirmed'].includes(orders[0].status))
      return res.status(400).json({ success: false, message: 'Order cannot be cancelled at this stage' });

    await db.query('UPDATE orders SET status=? WHERE id=?', ['cancelled', req.params.id]);
    res.json({ success: true, message: 'Order cancelled successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { placeOrder, getMyOrders, getOrderById, cancelOrder };
