// The Veggie King - Global JavaScript Utilities (Navbar, Footer, Toast, Loader, Modal)

document.addEventListener("DOMContentLoaded", () => {
  // 1. Inject Navbar & Footer if placeholders exist
  injectNavbar();
  injectFooter();

  // 2. Setup Sticky Navbar scroll effect
  const navbar = document.querySelector(".navbar") || document.querySelector(".nav-bar");
  if (navbar) {
    window.addEventListener("scroll", () => {
      if (window.scrollY > 20) {
        navbar.classList.add("scrolled");
      } else {
        navbar.classList.remove("scrolled");
      }
    });
  }

  // 3. Setup Mobile Navigation Menu
  setupMobileNav();

  // 4. Update Navigation User and Cart badge states
  updateNavState();
});

// --- Injections ---
function injectNavbar() {
  const placeholder = document.getElementById("navbar-placeholder");
  if (!placeholder) return;

  const currentPath = window.location.pathname;
  const isPageActive = (path) => currentPath.endsWith(path) ? "active" : "";

  placeholder.innerHTML = `
    <nav class="navbar">
      <div class="nav-container">
        <a href="./index.html" class="logo">
          <img src="./assets/icons/logo.svg" alt="The Veggie King Logo" />
        </a>
        
        <ul class="nav-links">
          <li><a href="./index.html#about-us">About Us</a></li>
          <li><a href="./menu.html" class="${isPageActive("menu.html") ? "active" : ""}">Menu</a></li>
          <li><a href="./index.html#contact">Contact</a></li>
        </ul>

        <div class="nav-actions">
          <a href="./wishlist.html" class="wishlist-btn" title="Wishlist">
            <span class="icon">❤️</span>
            <span class="wishlist-count badge" id="navWishlistCount">0</span>
          </a>
          <a href="./cart.html" class="cart-btn" id="navCartBtn">
            <span class="icon">🛒</span>
            <span class="cart-count" id="navCartCount">0</span>
          </a>
          <div class="user-menu-container" id="navUserMenuContainer">
            <a href="./auth.html" class="login-btn-nav" id="navAuthLink">Login</a>
          </div>
        </div>

        <button class="hamburger" aria-label="Toggle Navigation">
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
    </nav>
    <div class="mobile-drawer" id="mobileDrawer">
      <div class="drawer-header">
        <img src="./assets/icons/logo.svg" alt="The Veggie King Logo" style="height: 35px;" />
        <button class="drawer-close" id="drawerClose">&times;</button>
      </div>
      <ul class="drawer-links">
        <li><a href="./index.html#about-us">About Us</a></li>
        <li><a href="./menu.html">Menu</a></li>
        <li><a href="./index.html#contact">Contact</a></li>
        <li><a href="./wishlist.html">My Wishlist</a></li>
        <li><a href="./cart.html">My Cart</a></li>
        <li class="divider"></li>
        <li id="drawerUserActions"><a href="./auth.html">Login / Register</a></li>
      </ul>
    </div>
    <div class="drawer-overlay" id="drawerOverlay"></div>
  `;
}

function injectFooter() {
  const placeholder = document.getElementById("footer-placeholder");
  if (!placeholder) return;

  placeholder.innerHTML = `
    <footer class="main-footer">
      <div class="footer-container">
        <div class="footer-col footer-about">
          <div class="footer-logo">
            <img src="./assets/icons/logo.svg" alt="The Veggie King Logo" />
            <span class="logo-text">The Veggie <span>King</span></span>
          </div>
          <p>Created for lovers of healthy, delicious & fresh food. Experience premium culinary delights made with local ingredients.</p>
          <div class="social-links">
            <a href="#" class="social-icon" aria-label="Facebook"><span>FB</span></a>
            <a href="#" class="social-icon" aria-label="Instagram"><span>IG</span></a>
            <a href="#" class="social-icon" aria-label="Twitter"><span>TW</span></a>
          </div>
        </div>
        <div class="footer-col">
          <h3>Quick Links</h3>
          <ul>
            <li><a href="./index.html">Home</a></li>
            <li><a href="./menu.html">Our Menu</a></li>
            <li><a href="./about.html">About Us</a></li>
            <li><a href="./contact.html">Contact Us</a></li>
          </ul>
        </div>
        <div class="footer-col">
          <h3>Contact Info</h3>
          <ul class="contact-list">
            <li>📍 112, Sharda-Nagar, Saharanpur</li>
            <li>📞 +91 01234-567890</li>
            <li>✉️ support@veggieking.com</li>
            <li>🕒 12:00 PM - 9:00 PM</li>
          </ul>
        </div>
        <div class="footer-col footer-newsletter">
          <h3>Newsletter</h3>
          <p>Subscribe to receive tasty offers, recipes, and news!</p>
          <form class="newsletter-form" id="footerNewsletterForm">
            <input type="email" placeholder="Enter your email" required />
            <button type="submit">Subscribe</button>
          </form>
        </div>
      </div>
      <div class="footer-bottom">
        <p>&copy; ${new Date().getFullYear()} The Veggie King. All Rights Reserved.</p>
      </div>
    </footer>
    
    <!-- Global Toast Container -->
    <div id="global-toast" class="toast"></div>
  `;

  // Bind newsletter subscribe
  const newsletter = document.getElementById("footerNewsletterForm");
  if (newsletter) {
    newsletter.addEventListener("submit", (e) => {
      e.preventDefault();
      showToast("🎉 Thank you for subscribing to our newsletter!");
      newsletter.reset();
    });
  }
}

// --- Mobile Navigation Logic ---
function setupMobileNav() {
  const hamburger = document.querySelector(".hamburger");
  const drawer = document.getElementById("mobileDrawer");
  const overlay = document.getElementById("drawerOverlay");
  const closeBtn = document.getElementById("drawerClose");

  if (!hamburger || !drawer || !overlay) return;

  const toggleDrawer = () => {
    drawer.classList.toggle("open");
    overlay.classList.toggle("active");
    hamburger.classList.toggle("active");
  };

  hamburger.addEventListener("click", toggleDrawer);
  overlay.addEventListener("click", toggleDrawer);
  if (closeBtn) closeBtn.addEventListener("click", toggleDrawer);
}

// --- State and UI sync ---
function updateNavState() {
  const user = VK_API.getCurrentUser();
  
  // Update Cart badge
  const cart = VK_API.getCart();
  const totalItems = Object.values(cart).reduce((sum, qty) => sum + qty, 0);
  const cartBadge = document.getElementById("navCartCount");
  if (cartBadge) {
    cartBadge.textContent = totalItems;
    cartBadge.style.display = totalItems > 0 ? "flex" : "none";
  }

  // Update Wishlist badge
  const wishlist = VK_API.getWishlist();
  const wishlistBadge = document.getElementById("navWishlistCount");
  if (wishlistBadge) {
    wishlistBadge.textContent = wishlist.length;
    wishlistBadge.style.display = wishlist.length > 0 ? "flex" : "none";
  }

  // Update User profile menu/login btn
  const userContainer = document.getElementById("navUserMenuContainer");
  const drawerUserActions = document.getElementById("drawerUserActions");
  
  if (user && userContainer) {
    const firstName = user.name.split(" ")[0];
    userContainer.innerHTML = `
      <div class="nav-profile-dropdown">
        <button class="profile-dropdown-btn">👤 ${firstName} <span class="arrow">▼</span></button>
        <div class="dropdown-menu">
          <a href="./profile.html">My Profile</a>
          <a href="./orders.html">My Orders</a>
          <hr/>
          <a href="#" id="navLogoutBtn" class="logout-link">Logout</a>
        </div>
      </div>
    `;

    // Bind logout
    const logoutBtn = document.getElementById("navLogoutBtn");
    if (logoutBtn) {
      logoutBtn.addEventListener("click", (e) => {
        e.preventDefault();
        if (confirm("Are you sure you want to logout?")) {
          VK_API.logout();
          showToast("👋 Logged out successfully");
          setTimeout(() => { window.location.href = "./index.html"; }, 1000);
        }
      });
    }

    if (drawerUserActions) {
      drawerUserActions.innerHTML = `
        <a href="./profile.html">👤 My Profile</a>
        <a href="./orders.html">📦 My Orders</a>
        <a href="#" id="drawerLogoutBtn" style="color: var(--secondary)">Logout</a>
      `;
      document.getElementById("drawerLogoutBtn").addEventListener("click", (e) => {
        e.preventDefault();
        VK_API.logout();
        window.location.reload();
      });
    }
  }
}

// --- Global Toast Notification Utility ---
function showToast(message, type = "success") {
  const toast = document.getElementById("global-toast");
  if (!toast) return;

  toast.textContent = message;
  toast.className = `toast show ${type}`;
  
  setTimeout(() => {
    toast.classList.remove("show");
  }, 3000);
}

// --- Global Loading Spinner Utility ---
function showLoader() {
  let loader = document.getElementById("global-loader");
  if (!loader) {
    loader = document.createElement("div");
    loader.id = "global-loader";
    loader.className = "loader-overlay";
    loader.innerHTML = `<div class="spinner"></div>`;
    document.body.appendChild(loader);
  }
  loader.classList.add("visible");
}

function hideLoader() {
  const loader = document.getElementById("global-loader");
  if (loader) {
    loader.classList.remove("visible");
  }
}
