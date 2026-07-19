// The Veggie King - Mock API Layer (using localStorage)
const VK_API = {
  // --- AUTH ---
  login: async (email, password) => {
    // Simulating delay
    await new Promise(r => setTimeout(r, 400));
    const users = JSON.parse(localStorage.getItem("vk_users_list") || "[]");
    const user = users.find(u => u.email === email && u.password === password);
    if (user) {
      localStorage.setItem("vk_token", "mock_token_" + Date.now());
      localStorage.setItem("vk_user", JSON.stringify(user));
      return { success: true, user };
    }
    return { success: false, message: "Invalid email or password" };
  },

  register: async (name, email, phone, password) => {
    await new Promise(r => setTimeout(r, 400));
    const users = JSON.parse(localStorage.getItem("vk_users_list") || "[]");
    if (users.some(u => u.email === email)) {
      return { success: false, message: "Email is already registered" };
    }
    const newUser = { id: Date.now(), name, email, phone, password, address: "" };
    users.push(newUser);
    localStorage.setItem("vk_users_list", JSON.stringify(users));
    localStorage.setItem("vk_token", "mock_token_" + Date.now());
    localStorage.setItem("vk_user", JSON.stringify(newUser));
    return { success: true, user: newUser };
  },

  getCurrentUser: () => {
    const userStr = localStorage.getItem("vk_user");
    return userStr ? JSON.parse(userStr) : null;
  },

  updateProfile: async (name, phone, address) => {
    await new Promise(r => setTimeout(r, 300));
    const currentUser = VK_API.getCurrentUser();
    if (!currentUser) return { success: false, message: "Not logged in" };

    currentUser.name = name;
    currentUser.phone = phone;
    currentUser.address = address;

    localStorage.setItem("vk_user", JSON.stringify(currentUser));

    // Update in the users list too
    const users = JSON.parse(localStorage.getItem("vk_users_list") || "[]");
    const idx = users.findIndex(u => u.email === currentUser.email);
    if (idx !== -1) {
      users[idx] = currentUser;
      localStorage.setItem("vk_users_list", JSON.stringify(users));
    }
    return { success: true, user: currentUser };
  },

  logout: () => {
    localStorage.removeItem("vk_token");
    localStorage.removeItem("vk_user");
    localStorage.removeItem("vk_cart"); // Optionally clear cart, or keep it per-session
    return true;
  },

  // --- CART ---
  getCart: () => {
    const user = VK_API.getCurrentUser();
    if (!user) return {};
    const key = `vk_cart_${user.id}`;
    return JSON.parse(localStorage.getItem(key) || "{}");
  },

  addToCart: (productId, qty = 1) => {
    const user = VK_API.getCurrentUser();
    if (!user) return false;
    const key = `vk_cart_${user.id}`;
    const cart = JSON.parse(localStorage.getItem(key) || "{}");
    cart[productId] = (cart[productId] || 0) + qty;
    localStorage.setItem(key, JSON.stringify(cart));
    return cart;
  },

  updateCartQty: (productId, qty) => {
    const user = VK_API.getCurrentUser();
    if (!user) return false;
    const key = `vk_cart_${user.id}`;
    const cart = JSON.parse(localStorage.getItem(key) || "{}");
    if (qty <= 0) {
      delete cart[productId];
    } else {
      cart[productId] = qty;
    }
    localStorage.setItem(key, JSON.stringify(cart));
    return cart;
  },

  removeFromCart: (productId) => {
    return VK_API.updateCartQty(productId, 0);
  },

  clearCart: () => {
    const user = VK_API.getCurrentUser();
    if (!user) return;
    const key = `vk_cart_${user.id}`;
    localStorage.removeItem(key);
  },

  // --- WISHLIST ---
  getWishlist: () => {
    const user = VK_API.getCurrentUser();
    if (!user) return [];
    const key = `vk_wishlist_${user.id}`;
    return JSON.parse(localStorage.getItem(key) || "[]");
  },

  toggleWishlist: (productId) => {
    const user = VK_API.getCurrentUser();
    if (!user) return false;
    const key = `vk_wishlist_${user.id}`;
    let wishlist = JSON.parse(localStorage.getItem(key) || "[]");
    if (wishlist.includes(productId)) {
      wishlist = wishlist.filter(id => id !== productId);
    } else {
      wishlist.push(productId);
    }
    localStorage.setItem(key, JSON.stringify(wishlist));
    return wishlist;
  },

  // --- ORDERS ---
  getOrders: () => {
    const user = VK_API.getCurrentUser();
    if (!user) return [];
    const key = `vk_orders_${user.id}`;
    return JSON.parse(localStorage.getItem(key) || "[]");
  },

  placeOrder: async (address, paymentMethod, couponCode = "") => {
    await new Promise(r => setTimeout(r, 600));
    const user = VK_API.getCurrentUser();
    if (!user) return { success: false, message: "User not logged in" };

    const cart = VK_API.getCart();
    const productIds = Object.keys(cart);
    if (productIds.length === 0) return { success: false, message: "Cart is empty" };

    // Calculate total
    let itemsSubtotal = 0;
    const itemsList = [];
    productIds.forEach(id => {
      const product = VK_DATA.products.find(p => p.id === parseInt(id));
      if (product) {
        const qty = cart[id];
        itemsSubtotal += product.price * qty;
        itemsList.push({
          productId: product.id,
          name: product.name,
          price: product.price,
          quantity: qty,
          imageUrl: product.imageUrl
        });
      }
    });

    let discount = 0;
    if (couponCode.toUpperCase() === "VEGGIE10") {
      discount = Math.round(itemsSubtotal * 0.1);
    } else if (couponCode.toUpperCase() === "FREE50") {
      discount = 50;
    }

    const deliveryCharge = itemsSubtotal > 300 ? 0 : 30;
    const tax = Math.round(itemsSubtotal * 0.05); // 5% GST
    const total = itemsSubtotal - discount + deliveryCharge + tax;

    const newOrder = {
      orderId: "VK-" + Math.floor(100000 + Math.random() * 900000),
      date: new Date().toLocaleDateString("en-IN", { year: 'numeric', month: 'short', day: 'numeric' }),
      status: "Delivered",
      items: itemsList,
      subtotal: itemsSubtotal,
      discount,
      deliveryCharge,
      tax,
      total,
      address,
      paymentMethod
    };

    const ordersKey = `vk_orders_${user.id}`;
    const orders = JSON.parse(localStorage.getItem(ordersKey) || "[]");
    orders.unshift(newOrder); // Newest first
    localStorage.setItem(ordersKey, JSON.stringify(orders));

    // Clear cart
    VK_API.clearCart();

    return { success: true, order: newOrder };
  }
};
