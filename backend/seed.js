/**
 * Seed script - creates admin user and sample products
 * Run: node seed.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Product = require('./models/Product');

const products = [
  { name: 'Premium Medjool Dates', description: 'Soft, caramel-like Medjool dates. Rich in fiber and minerals.', pricePerKg: 1200, category: 'dates', inStock: true, rating: 4.8, isFeatured: true, images: [] },
  { name: 'Ajwa Dates (Madinah)', description: 'Premium Ajwa dates from Madinah. Known for exceptional health benefits.', pricePerKg: 2600, category: 'dates', inStock: true, rating: 4.9, isFeatured: true, images: [] },
  { name: 'Premium California Almonds', description: 'Rich in Vitamin E and healthy fats. Perfect for snacking and cooking.', pricePerKg: 1400, category: 'almonds', inStock: true, rating: 4.5, isFeatured: true, images: [] },
  { name: 'Whole Cashews W240', description: 'Creamy, buttery cashews. Grade W240 — finest quality available.', pricePerKg: 1800, category: 'cashews', inStock: true, rating: 4.7, isFeatured: true, images: [] },
  { name: 'Iranian Pistachios', description: 'Naturally salted, roasted pistachios from Iran. Crunchy and delicious.', pricePerKg: 2200, category: 'pistachios', inStock: true, rating: 4.6, isFeatured: false, images: [] },
  { name: 'Dates & Dry Fruits Combo', description: 'A perfect blend of Medjool dates, almonds, cashews and pistachios.', pricePerKg: 1600, category: 'combo', inStock: true, rating: 4.9, isFeatured: true, images: [] },
  { name: 'Cardamom (Elaichi)', description: 'Aromatic green cardamom pods. Freshly sourced from Kerala spice farms.', pricePerKg: 3000, category: 'spices', inStock: true, rating: 4.6, isFeatured: false, images: [] },
  { name: 'Saffron (Kesar)', description: 'Pure A-grade saffron threads. Adds rich colour and flavour to any dish.', pricePerKg: 80000, category: 'spices', inStock: true, rating: 4.8, isFeatured: true, images: [] },
  { name: 'Chia Seeds', description: 'Organic chia seeds packed with omega-3, fiber and protein.', pricePerKg: 600, category: 'seeds', inStock: true, rating: 4.5, isFeatured: false, images: [] },
  { name: 'Pumpkin Seeds', description: 'Raw pumpkin seeds — powerhouse of zinc, magnesium and healthy fats.', pricePerKg: 500, category: 'seeds', inStock: true, rating: 4.4, isFeatured: false, images: [] },
  { name: 'Rose Water Essence', description: 'Pure rose water flavoured essence. Perfect for sweets and desserts.', pricePerKg: 1400, category: 'essence', inStock: true, rating: 4.3, isFeatured: false, images: [] },
  { name: 'Kewra Essence', description: 'Authentic kewra (pandanus) essence. Adds floral aroma to biryanis.', pricePerKg: 1200, category: 'essence', inStock: true, rating: 4.2, isFeatured: false, images: [] },
];

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB');

  // Create admin
  const adminExists = await User.findOne({ email: 'admin@nutridry.com' });
  if (!adminExists) {
    await User.create({ name: 'Admin', email: 'admin@ashwindates.com', password: 'Admin@123', role: 'admin' });
    console.log('Admin created: admin@ashwindates.com / Admin@123');
  } else {
    console.log('Admin already exists');
  }

  // Create products
  await Product.deleteMany({});
  await Product.insertMany(products);
  console.log(`${products.length} products seeded`);

  await mongoose.disconnect();
  console.log('Done!');
}

seed().catch(console.error);
