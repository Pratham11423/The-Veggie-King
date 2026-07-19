-- =============================================
--   THE VEGGIE KING - MySQL Database Schema
-- =============================================

CREATE DATABASE IF NOT EXISTS veggie_king;
USE veggie_king;

-- ─── USERS ───────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  name         VARCHAR(100)  NOT NULL,
  email        VARCHAR(150)  NOT NULL UNIQUE,
  password     VARCHAR(255)  NOT NULL,
  phone        VARCHAR(20),
  address      TEXT,
  role         ENUM('customer','admin') DEFAULT 'customer',
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ─── CATEGORIES ──────────────────────────────
CREATE TABLE IF NOT EXISTS categories (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  name         VARCHAR(100) NOT NULL,
  image_url    VARCHAR(255),
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ─── MENU ITEMS ──────────────────────────────
CREATE TABLE IF NOT EXISTS menu_items (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  category_id  INT,
  name         VARCHAR(150) NOT NULL,
  description  TEXT,
  price        DECIMAL(10,2) NOT NULL,
  image_url    VARCHAR(255),
  is_available TINYINT(1) DEFAULT 1,
  is_veg       TINYINT(1) DEFAULT 1,
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
);

-- ─── OFFERS / DISCOUNTS ──────────────────────
CREATE TABLE IF NOT EXISTS offers (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  title          VARCHAR(150) NOT NULL,
  description    TEXT,
  discount_type  ENUM('percentage','flat') NOT NULL,
  discount_value DECIMAL(10,2) NOT NULL,
  code           VARCHAR(50) UNIQUE,
  min_order      DECIMAL(10,2) DEFAULT 0,
  max_discount   DECIMAL(10,2),
  is_active      TINYINT(1) DEFAULT 1,
  start_date     DATE,
  end_date       DATE,
  image_url      VARCHAR(255),
  created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ─── ORDERS ──────────────────────────────────
CREATE TABLE IF NOT EXISTS orders (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  user_id         INT NOT NULL,
  total_amount    DECIMAL(10,2) NOT NULL,
  discount_amount DECIMAL(10,2) DEFAULT 0,
  final_amount    DECIMAL(10,2) NOT NULL,
  offer_id        INT,
  status          ENUM('pending','confirmed','preparing','out_for_delivery','delivered','cancelled') DEFAULT 'pending',
  payment_status  ENUM('pending','paid','failed','refunded') DEFAULT 'pending',
  payment_method  ENUM('cod','online') DEFAULT 'cod',
  delivery_address TEXT NOT NULL,
  notes           TEXT,
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id)  REFERENCES users(id)  ON DELETE CASCADE,
  FOREIGN KEY (offer_id) REFERENCES offers(id) ON DELETE SET NULL
);

-- ─── ORDER ITEMS ─────────────────────────────
CREATE TABLE IF NOT EXISTS order_items (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  order_id     INT NOT NULL,
  menu_item_id INT NOT NULL,
  quantity     INT NOT NULL DEFAULT 1,
  price        DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (order_id)     REFERENCES orders(id)     ON DELETE CASCADE,
  FOREIGN KEY (menu_item_id) REFERENCES menu_items(id) ON DELETE CASCADE
);

-- ─── CART ────────────────────────────────────
CREATE TABLE IF NOT EXISTS cart (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  user_id      INT NOT NULL,
  menu_item_id INT NOT NULL,
  quantity     INT NOT NULL DEFAULT 1,
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_cart_item (user_id, menu_item_id),
  FOREIGN KEY (user_id)      REFERENCES users(id)      ON DELETE CASCADE,
  FOREIGN KEY (menu_item_id) REFERENCES menu_items(id) ON DELETE CASCADE
);

-- ─── DELIVERY TRACKING ───────────────────────
CREATE TABLE IF NOT EXISTS delivery_tracking (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  order_id     INT NOT NULL UNIQUE,
  status       ENUM('order_placed','confirmed','preparing','picked_up','on_the_way','delivered') DEFAULT 'order_placed',
  rider_name   VARCHAR(100),
  rider_phone  VARCHAR(20),
  eta_minutes  INT,
  latitude     DECIMAL(10,8),
  longitude    DECIMAL(11,8),
  updated_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

-- ─── PAYMENTS ────────────────────────────────
CREATE TABLE IF NOT EXISTS payments (
  id               INT AUTO_INCREMENT PRIMARY KEY,
  order_id         INT NOT NULL,
  user_id          INT NOT NULL,
  amount           DECIMAL(10,2) NOT NULL,
  method           ENUM('cod','razorpay','upi') NOT NULL,
  transaction_id   VARCHAR(255),
  razorpay_order_id VARCHAR(255),
  status           ENUM('pending','success','failed','refunded') DEFAULT 'pending',
  created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id)  ON DELETE CASCADE,
  FOREIGN KEY (user_id)  REFERENCES users(id)   ON DELETE CASCADE
);

-- ─── SEED: CATEGORIES ────────────────────────
INSERT INTO categories (name) VALUES
  ('Burgers'),
  ('Salads'),
  ('Wraps'),
  ('Drinks'),
  ('Desserts');

-- ─── SEED: MENU ITEMS ────────────────────────
INSERT INTO menu_items (category_id, name, description, price, image_url, is_veg) VALUES
  (1, 'Mighty Burger',   'A towering veggie burger with fresh greens and house sauce', 149.00, '/assets/images/menu-section-mighty-burger.png',  1),
  (2, 'Chickpea Salad',  'Hearty chickpeas tossed with garden veggies and lemon dressing', 119.00, '/assets/images/menu-section-chickpae-salad.png', 1),
  (3, 'Chickpea Wrap',   'Spiced chickpeas wrapped in a soft tortilla with fresh veggies', 129.00, '/assets/images/menu-section-chickpae-wrap.png',  1),
  (4, 'Green Smoothie',  'Spinach, banana, mango blended to perfection',                   89.00,  NULL, 1),
  (5, 'Vegan Brownie',   'Rich, fudgy brownie made with zero dairy',                       79.00,  NULL, 1);

-- ─── SEED: OFFERS ────────────────────────────
INSERT INTO offers (title, description, discount_type, discount_value, code, min_order, max_discount, is_active, start_date, end_date) VALUES
  ('Welcome Offer',  '20% off on your first order',   'percentage', 20, 'WELCOME20', 100, 100, 1, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 30 DAY)),
  ('Flat ₹50 Off',   '₹50 off on orders above ₹300',  'flat',       50, 'FLAT50',    300, 50,  1, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 15 DAY)),
  ('Weekend Special','15% off every weekend',          'percentage', 15, 'WEEKEND15', 150, 75,  1, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 60 DAY));

-- ─── SEED: ADMIN USER ────────────────────────
-- Password: Admin@123 (bcrypt hashed — update via backend on first run)
INSERT INTO users (name, email, password, role) VALUES
  ('Admin', 'admin@veggieking.com', '$2b$10$placeholder_change_on_first_run', 'admin');
