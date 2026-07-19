// =============================================
//   THE VEGGIE KING — Express Backend Server
// =============================================
const express      = require('express');
const cors         = require('cors');
const helmet       = require('helmet');
const rateLimit    = require('express-rate-limit');
require('dotenv').config();

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL || '*', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/api/', rateLimit({ windowMs: 15*60*1000, max: 100, message: { success:false, message:'Too many requests' } }));

app.use('/api/auth',     require('./routes/auth'));
app.use('/api/menu',     require('./routes/menu'));
app.use('/api/cart',     require('./routes/cart'));
app.use('/api/orders',   require('./routes/orders'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/tracking', require('./routes/tracking'));
app.use('/api/offers',   require('./routes/offers'));
app.use('/api/admin',    require('./routes/admin'));

app.get('/api/health', (req, res) => res.json({ success: true, message: '🥦 Veggie King API is live!', timestamp: new Date() }));
app.use((req, res) => res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` }));
app.use((err, req, res, next) => { console.error(err.stack); res.status(err.status||500).json({ success: false, message: err.message||'Server error' }); });

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => { console.log(`\n🥦 Veggie King running → http://localhost:${PORT}/api/health\n`); });
