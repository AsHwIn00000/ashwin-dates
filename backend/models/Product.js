const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  // Admin enters price per kg; prices for other weights are auto-calculated
  pricePerKg: { type: Number, required: true, min: 1 },
  // Calculated prices stored for quick access
  prices: {
    '100g':  { type: Number },
    '250g':  { type: Number },
    '500g':  { type: Number },
    '1kg':   { type: Number },
  },
  category: {
    type: String,
    required: true,
    enum: ['almonds', 'cashews', 'pistachios', 'dates', 'combo', 'spices', 'seeds', 'essence', 'others'],
  },
  inStock: { type: Boolean, default: true },
  images: [{ type: String }],
  rating: { type: Number, default: 0, min: 0, max: 5 },
  numReviews: { type: Number, default: 0 },
  isFeatured: { type: Boolean, default: false },
}, { timestamps: true });

// Auto-calculate prices before save
productSchema.pre('save', function (next) {
  const pkgRatio = { '100g': 0.1, '250g': 0.25, '500g': 0.5, '1kg': 1 };
  this.prices = {};
  for (const [weight, ratio] of Object.entries(pkgRatio)) {
    this.prices[weight] = Math.round(this.pricePerKg * ratio);
  }
  next();
});

// Text index for search
productSchema.index({ name: 'text', description: 'text', category: 'text' });

module.exports = mongoose.model('Product', productSchema);
