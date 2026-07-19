# 🥦 THE VEGGIE KING — Backend Setup Guide

## ⚡ Quick Start (Step by Step)

### Step 1 — Copy this folder
Place the `veggie-king-backend` folder anywhere on your computer, e.g. next to your frontend folder.

### Step 2 — Install dependencies
```bash
cd veggie-king-backend
npm install
```

### Step 3 — Setup MySQL Database
Open **MySQL Workbench** or **MySQL command line** and run:
```sql
source /path/to/veggie-king-backend/sql/schema.sql
```
Or open the file in MySQL Workbench and click ⚡ Execute.
This creates the database, all tables, and sample data automatically.

### Step 4 — Configure environment
```bash
# Copy the example file
cp .env.example .env
```
Open `.env` and update:
```
DB_PASSWORD=your_mysql_root_password
FRONTEND_URL=http://127.0.0.1:5500   ← your frontend Live Server URL
```

### Step 5 — Create admin user properly
Run this once to set the admin password correctly:
```bash
node -e "
const bcrypt = require('bcryptjs');
const mysql  = require('mysql2/promise');
require('dotenv').config();
(async () => {
  const db = await mysql.createConnection({ host:'localhost', user: process.env.DB_USER, password: process.env.DB_PASSWORD, database: process.env.DB_NAME });
  const hash = await bcrypt.hash('Admin@123', 10);
  await db.execute('UPDATE users SET password=? WHERE email=?', [hash, 'admin@veggieking.com']);
  console.log('✅ Admin password set!');
  process.exit(0);
})();
"
```

### Step 6 — Start the server
```bash
npm run dev     # development (auto-restart on change)
# OR
npm start       # production
```

You should see:
```
✅ MySQL connected successfully
🥦 Veggie King running → http://localhost:5000/api/health
```

---

## 📡 Complete API Reference

### 🔐 AUTH
| Method | Endpoint                    | Auth | Description         |
|--------|-----------------------------|------|---------------------|
| POST   | /api/auth/register          | ❌   | Register user       |
| POST   | /api/auth/login             | ❌   | Login               |
| GET    | /api/auth/profile           | ✅   | Get my profile      |
| PUT    | /api/auth/profile           | ✅   | Update profile      |
| PUT    | /api/auth/change-password   | ✅   | Change password     |

**Register body:**
```json
{ "name": "Rahul", "email": "rahul@gmail.com", "password": "Pass@123", "phone": "9876543210", "address": "Saharanpur" }
```
**Login body:**
```json
{ "email": "rahul@gmail.com", "password": "Pass@123" }
```
**Response gives you a token — save it and send as:**
```
Authorization: Bearer <token>
```

---

### 🥗 MENU
| Method | Endpoint         | Auth       | Description            |
|--------|------------------|------------|------------------------|
| GET    | /api/menu        | ❌         | All menu items         |
| GET    | /api/menu?category_id=1 | ❌  | Filter by category     |
| GET    | /api/menu?veg_only=true | ❌  | Veg items only         |
| GET    | /api/menu/categories | ❌    | All categories         |
| GET    | /api/menu/:id    | ❌         | Single item            |
| POST   | /api/menu        | ✅ Admin   | Add menu item          |
| PUT    | /api/menu/:id    | ✅ Admin   | Update menu item       |
| DELETE | /api/menu/:id    | ✅ Admin   | Delete menu item       |

---

### 🛒 CART
| Method | Endpoint               | Auth | Description        |
|--------|------------------------|------|--------------------|
| GET    | /api/cart              | ✅   | View cart          |
| POST   | /api/cart              | ✅   | Add item to cart   |
| PUT    | /api/cart/:menu_item_id| ✅   | Update quantity    |
| DELETE | /api/cart/:menu_item_id| ✅   | Remove item        |
| DELETE | /api/cart              | ✅   | Clear entire cart  |

**Add to cart body:**
```json
{ "menu_item_id": 1, "quantity": 2 }
```

---

### 📦 ORDERS
| Method | Endpoint             | Auth | Description      |
|--------|----------------------|------|------------------|
| POST   | /api/orders          | ✅   | Place order      |
| GET    | /api/orders          | ✅   | My orders        |
| GET    | /api/orders/:id      | ✅   | Order details    |
| PUT    | /api/orders/:id/cancel | ✅ | Cancel order     |

**Place order body:**
```json
{
  "delivery_address": "112, Sharda Nagar, Saharanpur",
  "payment_method": "cod",
  "offer_code": "WELCOME20",
  "notes": "Extra spicy please"
}
```

---

### 🎁 OFFERS (Homepage Banner)
| Method | Endpoint              | Auth     | Description          |
|--------|-----------------------|----------|----------------------|
| GET    | /api/offers           | ❌       | Active offers        |
| POST   | /api/offers/validate  | ✅       | Validate coupon code |
| POST   | /api/offers           | ✅ Admin | Create offer         |
| PUT    | /api/offers/:id       | ✅ Admin | Update offer         |
| DELETE | /api/offers/:id       | ✅ Admin | Delete offer         |

**Validate coupon body:**
```json
{ "code": "WELCOME20", "cart_total": 350 }
```

---

### 💳 PAYMENTS
| Method | Endpoint                    | Auth | Description              |
|--------|-----------------------------|------|--------------------------|
| POST   | /api/payments/create-order  | ✅   | Create Razorpay order    |
| POST   | /api/payments/verify        | ✅   | Verify Razorpay payment  |
| POST   | /api/payments/cod           | ✅   | Confirm COD order        |
| GET    | /api/payments/history       | ✅   | Payment history          |

---

### 🛵 DELIVERY TRACKING
| Method | Endpoint                | Auth     | Description         |
|--------|-------------------------|----------|---------------------|
| GET    | /api/tracking/:order_id | ✅       | Track my order      |
| PUT    | /api/tracking/:order_id | ✅ Admin | Update rider status |

**Tracking statuses (in order):**
`order_placed → confirmed → preparing → picked_up → on_the_way → delivered`

---

### 👑 ADMIN
| Method | Endpoint                       | Auth     | Description       |
|--------|--------------------------------|----------|-------------------|
| GET    | /api/admin/dashboard           | ✅ Admin | Stats overview    |
| GET    | /api/admin/orders              | ✅ Admin | All orders        |
| PUT    | /api/admin/orders/:id/status   | ✅ Admin | Update status     |
| GET    | /api/admin/users               | ✅ Admin | All users         |
| GET    | /api/admin/revenue             | ✅ Admin | Revenue chart data|

**Admin login:**
```json
{ "email": "admin@veggieking.com", "password": "Admin@123" }
```

---

## 🌐 Connect to Your Frontend

Add this to your frontend JS to connect to the backend:

```javascript
const API = 'http://localhost:5000/api';

// Example: Load menu on page load
fetch(`${API}/menu`)
  .then(r => r.json())
  .then(data => console.log(data.items));

// Example: Load active offers for homepage banner
fetch(`${API}/offers`)
  .then(r => r.json())
  .then(data => console.log(data.offers));

// Example: Login
fetch(`${API}/auth/login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'user@email.com', password: 'password' })
}).then(r => r.json()).then(data => {
  localStorage.setItem('vk_token', data.token);
});

// Helper for authenticated requests
const authFetch = (url, options = {}) => fetch(url, {
  ...options,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('vk_token')}`,
    ...options.headers
  }
});

// Example: Add to cart
authFetch(`${API}/cart`, {
  method: 'POST',
  body: JSON.stringify({ menu_item_id: 1, quantity: 1 })
}).then(r => r.json()).then(console.log);
```

---

## 🗂️ Project Structure
```
veggie-king-backend/
├── server.js              ← Entry point
├── .env.example           ← Copy to .env
├── package.json
├── sql/
│   └── schema.sql         ← Run this in MySQL first!
├── config/
│   └── db.js              ← MySQL connection pool
├── middleware/
│   └── auth.js            ← JWT protection
├── controllers/
│   ├── authController.js
│   ├── menuController.js
│   ├── cartController.js
│   ├── orderController.js
│   ├── offerController.js
│   ├── paymentController.js
│   ├── trackingController.js
│   └── adminController.js
└── routes/
    ├── auth.js
    ├── menu.js
    ├── cart.js
    ├── orders.js
    ├── offers.js
    ├── payments.js
    ├── tracking.js
    └── admin.js
```

---

## 🚀 Going Live (Deployment)
For deployment, use **Railway** or **Render** (both free):
1. Push backend to GitHub
2. Connect repo to Railway/Render
3. Set environment variables in their dashboard
4. Use PlanetScale or Railway MySQL for cloud database

---

*Made with ❤️ for The Veggie King 🥦*
