const db = require('../config/db');

const TRACKING_STEPS = ['order_placed','confirmed','preparing','picked_up','on_the_way','delivered'];

// GET /api/tracking/:order_id  — customer view
const getTracking = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT dt.*, o.user_id, o.status AS order_status, o.created_at AS order_time
       FROM delivery_tracking dt
       JOIN orders o ON dt.order_id = o.id
       WHERE dt.order_id=?`,
      [req.params.order_id]
    );
    if (!rows.length) return res.status(404).json({ success: false, message: 'Tracking info not found' });

    // Only allow the order owner or admin
    if (rows[0].user_id !== req.user.id && req.user.role !== 'admin')
      return res.status(403).json({ success: false, message: 'Access denied' });

    const tracking = rows[0];
    const currentStep = TRACKING_STEPS.indexOf(tracking.status);
    tracking.progress_percent = Math.round(((currentStep + 1) / TRACKING_STEPS.length) * 100);
    tracking.steps = TRACKING_STEPS.map((step, i) => ({
      step,
      label: step.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
      completed: i <= currentStep,
      current: i === currentStep
    }));

    res.json({ success: true, tracking });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/tracking/:order_id  (admin only) — update delivery status
const updateTracking = async (req, res) => {
  try {
    const { status, rider_name, rider_phone, eta_minutes, latitude, longitude } = req.body;

    if (!TRACKING_STEPS.includes(status))
      return res.status(400).json({ success: false, message: `Status must be one of: ${TRACKING_STEPS.join(', ')}` });

    await db.query(
      `UPDATE delivery_tracking
       SET status=?, rider_name=?, rider_phone=?, eta_minutes=?, latitude=?, longitude=?
       WHERE order_id=?`,
      [status, rider_name, rider_phone, eta_minutes, latitude, longitude, req.params.order_id]
    );

    // Sync order status
    const orderStatus =
      status === 'delivered'    ? 'delivered' :
      status === 'on_the_way'   ? 'out_for_delivery' :
      status === 'confirmed'    ? 'confirmed' :
      status === 'preparing'    ? 'preparing' : 'confirmed';

    await db.query('UPDATE orders SET status=? WHERE id=?', [orderStatus, req.params.order_id]);
    if (status === 'delivered') {
      await db.query('UPDATE payments SET status=? WHERE order_id=? AND method=?', ['success', req.params.order_id, 'cod']);
    }

    res.json({ success: true, message: `Tracking updated to: ${status}` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getTracking, updateTracking };
