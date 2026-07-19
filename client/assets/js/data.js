// The Veggie King - Centralized Mock Data
const VK_DATA = {
  categories: [
    { id: "burgers", name: "Burgers", emoji: "🍔", imageUrl: "assets/images/menu-section-mighty-burger.png" },
    { id: "salads", name: "Salads", emoji: "🥗", imageUrl: "assets/images/menu-section-chickpae-salad.png" },
    { id: "wraps", name: "Wraps", emoji: "🌯", imageUrl: "assets/images/menu-section-chickpae-wrap.png" },
    { id: "drinks", name: "Drinks", emoji: "🥤", imageUrl: "assets/icons/phone-icon.svg" },
    { id: "desserts", name: "Desserts", emoji: "🍮", imageUrl: "assets/icons/time-icon.svg" }
  ],
  products: [
    {
      id: 1,
      name: "Mighty Burger",
      category: "Burgers",
      categoryId: "burgers",
      description: "A huge burger packed with crispy veg patty, fresh veggies, and our secret burger sauce.",
      price: 149,
      rating: 4.8,
      isVeg: true,
      isPopular: true,
      isFeatured: true,
      imageUrl: "assets/images/menu-section-mighty-burger.png",
      ingredients: ["Veg Patty", "Lettuce", "Tomato", "Cheese Slice", "Secret Sauce", "Sesame Buns"],
      nutrition: { calories: "450 kcal", protein: "12g", carbs: "55g", fat: "18g" }
    },
    {
      id: 2,
      name: "Chickpea Salad",
      category: "Salads",
      categoryId: "salads",
      description: "A refreshing and healthy salad loaded with protein-rich chickpeas, cucumbers, and olive oil dressing.",
      price: 119,
      rating: 4.5,
      isVeg: true,
      isPopular: true,
      isFeatured: true,
      imageUrl: "assets/images/menu-section-chickpae-salad.png",
      ingredients: ["Chickpeas", "Cucumber", "Cherry Tomatoes", "Onions", "Olive Oil", "Lemon Juice"],
      nutrition: { calories: "220 kcal", protein: "9g", carbs: "28g", fat: "6g" }
    },
    {
      id: 3,
      name: "Chickpea Wrap",
      category: "Wraps",
      categoryId: "wraps",
      description: "Warm tortilla wrapped around grilled spiced chickpeas, fresh herbs, and hummus.",
      price: 129,
      rating: 4.6,
      isVeg: true,
      isPopular: true,
      isFeatured: true,
      imageUrl: "assets/images/menu-section-chickpae-wrap.png",
      ingredients: ["Tortilla Wrap", "Spiced Chickpeas", "Hummus", "Lettuce", "Coriander Dressing"],
      nutrition: { calories: "340 kcal", protein: "11g", carbs: "48g", fat: "10g" }
    },
    {
      id: 4,
      name: "Veggie Delight Pizza",
      category: "Burgers",
      categoryId: "burgers",
      description: "A delicious single-serving flatbread pizza topped with olives, bell peppers, sweet corn, and mozzarella.",
      price: 199,
      rating: 4.9,
      isVeg: true,
      isPopular: true,
      isFeatured: false,
      imageUrl: "assets/images/gallery-photo-1.png",
      ingredients: ["Pizza Base", "Pizza Sauce", "Mozzarella Cheese", "Bell Peppers", "Olives", "Sweet Corn"],
      nutrition: { calories: "380 kcal", protein: "14g", carbs: "42g", fat: "15g" }
    },
    {
      id: 5,
      name: "Avocado Toast",
      category: "Salads",
      categoryId: "salads",
      description: "Sourdough toast spread with rich mashed avocado, cherry tomatoes, and microgreens.",
      price: 159,
      rating: 4.7,
      isVeg: true,
      isPopular: false,
      isFeatured: true,
      imageUrl: "assets/images/gallery-photo-2.png",
      ingredients: ["Sourdough Bread", "Avocado", "Cherry Tomatoes", "Salt & Pepper", "Olive Oil"],
      nutrition: { calories: "280 kcal", protein: "6g", carbs: "24g", fat: "16g" }
    },
    {
      id: 6,
      name: "Fresh Strawberry Shake",
      category: "Drinks",
      categoryId: "drinks",
      description: "Creamy, chilled milkshake made with fresh, hand-picked strawberries.",
      price: 99,
      rating: 4.4,
      isVeg: true,
      isPopular: false,
      isFeatured: false,
      imageUrl: "assets/images/gallery-photo-3.png",
      ingredients: ["Fresh Strawberries", "Milk", "Vanilla Ice Cream", "Sugar"],
      nutrition: { calories: "210 kcal", protein: "4g", carbs: "35g", fat: "5g" }
    },
    {
      id: 7,
      name: "Chocolate Lava Cake",
      category: "Desserts",
      categoryId: "desserts",
      description: "Warm, rich chocolate cake with a molten chocolate center that flows out.",
      price: 129,
      rating: 4.9,
      isVeg: true,
      isPopular: true,
      isFeatured: true,
      imageUrl: "assets/images/gallery-photo-4.png",
      ingredients: ["Cocoa Powder", "Dark Chocolate", "Flour", "Butter", "Sugar"],
      nutrition: { calories: "350 kcal", protein: "5g", carbs: "45g", fat: "18g" }
    },
    {
      id: 8,
      name: "Blue Mojito",
      category: "Drinks",
      categoryId: "drinks",
      description: "A sparkling, refreshing blend of blue curacao, fresh mint, lime, and club soda.",
      price: 89,
      rating: 4.3,
      isVeg: true,
      isPopular: true,
      isFeatured: false,
      imageUrl: "assets/images/gallery-photo-5.png",
      ingredients: ["Blue Curacao", "Mint Leaves", "Lime Juice", "Soda", "Ice"],
      nutrition: { calories: "90 kcal", protein: "0g", carbs: "22g", fat: "0g" }
    }
  ],
  testimonials: [
    {
      id: 1,
      name: "Rohit Sharma",
      rating: 5,
      review: "The Mighty Burger here is absolutely unmatched. Fresh, juicy, and 100% vegetarian. Delivery was super fast!",
      imageUrl: "assets/images/gallery-photo-6.png"
    },
    {
      id: 2,
      name: "Ananya Sen",
      rating: 5,
      review: "Healthy food usually tastes boring, but their Chickpea Salad and avocado toast are out of this world. Highly recommend!",
      imageUrl: "assets/images/gallery-photo-5.png"
    },
    {
      id: 3,
      name: "Vikram Malhotra",
      rating: 4,
      review: "I order from The Veggie King almost every weekend. Great quality, consistent taste, and love the eco-friendly packaging.",
      imageUrl: "assets/images/gallery-photo-4.png"
    }
  ],
  faqs: [
    { question: "Are all your products 100% vegetarian?", answer: "Yes, The Veggie King is a 100% vegetarian restaurant. We also offer vegan options clearly marked on our menu." },
    { question: "How long does standard delivery take?", answer: "We deliver within 30-45 minutes depending on your distance from our nearest outlet." },
    { question: "Can I customize my orders?", answer: "Absolutely! You can choose toppings, adjust spicy levels, or add special instructions on the product page or checkout." },
    { question: "Do you cater for events or bulk orders?", answer: "Yes, we cater for birthdays, corporate events, and family gatherings. Reach out to us via the contact form or phone." }
  ]
};
