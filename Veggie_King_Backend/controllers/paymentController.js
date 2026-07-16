const db      = require('../config/db');
const crypto  = require('crypto');
require('dotenv').config();

// Lazily init Razorpay so app still runs even if keys are missing
let razorpay = null;
const getRazorpay = () => {
  if (!razorpay) {
    const Razorpay = require('razorpay');
    razorpay = new Razorpay({
      key_id:     process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
  }
  return razorpay;
};

// POST /api/payments/create-order  — initiate Razorpay order
const createRazorpayOrder = async (req, res) => {
  try {
    const { order_id } = req.body;
    const [orders] = await db.query('SELECT * FROM orders WHERE id=? AND user_id=?', [order_id, req.user.id]);
    if (!orders.length) return res.status(404).json({ success: false, message: 'Order not found' });

    const order = orders[0];
    const rz = getRazorpay();
    const rzOrder = await rz.orders.create({
      amount:   Math.round(order.final_amount * 100), // paise
      currency: 'INR',
      receipt:  `vk_order_${order_id}`,
    });

    // Save razorpay_order_id in payments
    await db.query(
      `INSERT INTO payments (order_id, user_id, amount, method, razorpay_order_id, status)
       VALUES (?,?,?,?,?,?)`,
      [order_id, req.user.id, order.final_amount, 'razorpay', rzOrder.id, 'pending']
    );

    res.json({
      success: true,
      razorpay_order_id: rzOrder.id,
      amount:            rzOrder.amount,
      currency:          rzOrder.currency,
      key_id:            process.env.RAZORPAY_KEY_ID,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/payments/verify  — verify Razorpay signature
const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, order_id } = req.body;

    const generated = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (generated !== razorpay_signature)
      return res.status(400).json({ success: false, message: 'Payment verification failed' });

    // Update payment & order
    await db.query(
      `UPDATE payments SET status='success', transaction_id=? WHERE razorpay_order_id=?`,
      [razorpay_payment_id, razorpay_order_id]
    );
    await db.query(
      `UPDATE orders SET payment_status='paid', status='confirmed' WHERE id=?`,
      [order_id]
    );
    await db.query(
      `UPDATE delivery_tracking SET status='confirmed' WHERE order_id=?`,
      [order_id]
    );

    res.json({ success: true, message: 'Payment successful! Your order is confirmed.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/payments/cod  — mark COD order as confirmed
const confirmCOD = async (req, res) => {
  try {
    const { order_id } = req.body;
    const [orders] = await db.query('SELECT * FROM orders WHERE id=? AND user_id=?', [order_id, req.user.id]);
    if (!orders.length) return res.status(404).json({ success: false, message: 'Order not found' });

    await db.query(
      `INSERT INTO payments (order_id, user_id, amount, method, status) VALUES (?,?,?,'cod','pending')`,
      [order_id, req.user.id, orders[0].final_amount]
    );
    await db.query(`UPDATE orders SET status='confirmed' WHERE id=?`, [order_id]);
    await db.query(`UPDATE delivery_tracking SET status='confirmed' WHERE order_id=?`, [order_id]);

    res.json({ success: true, message: 'COD order confirmed. Pay on delivery.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/payments/history
const getPaymentHistory = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT p.*, o.status AS order_status FROM payments p
       JOIN orders o ON p.order_id = o.id
       WHERE p.user_id=? ORDER BY p.created_at DESC`,
      [req.user.id]
    );
    res.json({ success: true, payments: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { createRazorpayOrder, verifyPayment, confirmCOD, getPaymentHistory };
