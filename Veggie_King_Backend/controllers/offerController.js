const db = require('../config/db');

// GET /api/offers  — active offers for homepage banner
const getActiveOffers = async (req, res) => {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const [rows] = await db.query(
      `SELECT id, title, description, discount_type, discount_value, code, min_order, image_url, end_date
       FROM offers
       WHERE is_active=1 AND start_date<=? AND end_date>=?
       ORDER BY discount_value DESC`,
      [today, today]
    );
    res.json({ success: true, offers: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/offers/validate  — validate a coupon code
const validateOffer = async (req, res) => {
  try {
    const { code, cart_total } = req.body;
    if (!code) return res.status(400).json({ success: false, message: 'Offer code required' });

    const today = new Date().toISOString().slice(0, 10);
    const [rows] = await db.query(
      `SELECT * FROM offers WHERE code=? AND is_active=1 AND start_date<=? AND end_date>=?`,
      [code.toUpperCase(), today, today]
    );

    if (!rows.length) return res.status(404).json({ success: false, message: 'Invalid or expired offer code' });

    const offer = rows[0];
    if (cart_total < offer.min_order)
      return res.status(400).json({
        success: false,
        message: `Minimum order of ₹${offer.min_order} required for this offer`
      });

    const discount = offer.discount_type === 'percentage'
      ? Math.min((cart_total * offer.discount_value) / 100, offer.max_discount || Infinity)
      : offer.discount_value;

    res.json({
      success: true,
      message: 'Offer applied!',
      offer: {
        id: offer.id,
        title: offer.title,
        code: offer.code,
        discount_type: offer.discount_type,
        discount_value: offer.discount_value,
        discount_amount: parseFloat(discount).toFixed(2)
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/offers  (admin only)
const createOffer = async (req, res) => {
  try {
    const { title, description, discount_type, discount_value, code, min_order, max_discount, start_date, end_date, image_url } = req.body;
    await db.query(
      `INSERT INTO offers (title,description,discount_type,discount_value,code,min_order,max_discount,start_date,end_date,image_url)
       VALUES (?,?,?,?,?,?,?,?,?,?)`,
      [title, description, discount_type, discount_value, code?.toUpperCase(), min_order || 0, max_discount, start_date, end_date, image_url]
    );
    res.status(201).json({ success: true, message: 'Offer created successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/offers/:id  (admin only)
const updateOffer = async (req, res) => {
  try {
    const { title, description, discount_type, discount_value, code, min_order, max_discount, is_active, start_date, end_date } = req.body;
    await db.query(
      `UPDATE offers SET title=?,description=?,discount_type=?,discount_value=?,code=?,
       min_order=?,max_discount=?,is_active=?,start_date=?,end_date=? WHERE id=?`,
      [title, description, discount_type, discount_value, code?.toUpperCase(), min_order, max_discount, is_active, start_date, end_date, req.params.id]
    );
    res.json({ success: true, message: 'Offer updated' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/offers/:id  (admin only)
const deleteOffer = async (req, res) => {
  try {
    await db.query('DELETE FROM offers WHERE id=?', [req.params.id]);
    res.json({ success: true, message: 'Offer deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getActiveOffers, validateOffer, createOffer, updateOffer, deleteOffer };
