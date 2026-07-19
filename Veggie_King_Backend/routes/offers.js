const express = require('express');
const router  = express.Router();
const { getActiveOffers, validateOffer, createOffer, updateOffer, deleteOffer } = require('../controllers/offerController');
const { protect, adminOnly } = require('../middleware/auth');

router.get  ('/',           getActiveOffers);
router.post ('/validate',   protect, validateOffer);
router.post ('/',           protect, adminOnly, createOffer);
router.put  ('/:id',        protect, adminOnly, updateOffer);
router.delete('/:id',       protect, adminOnly, deleteOffer);

module.exports = router;
