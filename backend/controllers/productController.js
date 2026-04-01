const Product = require('../models/Product');

exports.getProducts = async (req, res) => {
  try {
    const { category, search, page = 1, limit = 12, sort } = req.query;
    const query = {};
    if (category && category !== 'all') query.category = category;
    if (search) query.$text = { $search: search };

    let sortOption = { createdAt: -1 };
    if (sort === 'price_asc') sortOption = { pricePerKg: 1 };
    else if (sort === 'price_desc') sortOption = { pricePerKg: -1 };
    else if (sort === 'rating') sortOption = { rating: -1 };

    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .sort(sortOption)
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({ products, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getFeatured = async (req, res) => {
  try {
    const products = await Product.find({ isFeatured: true }).limit(8);
    res.json(products);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.createProduct = async (req, res) => {
  try {
    const images = req.files ? req.files.map(f => `/uploads/${f.filename}`) : [];
    const { name, description, pricePerKg, category, inStock, isFeatured } = req.body;
    const product = await Product.create({
      name, description,
      pricePerKg: Number(pricePerKg),
      category,
      inStock: inStock === 'true' || inStock === true,
      isFeatured: isFeatured === 'true' || isFeatured === true,
      images,
    });
    res.status(201).json(product);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    const { name, description, pricePerKg, category, inStock, isFeatured } = req.body;
    if (name) product.name = name;
    if (description) product.description = description;
    if (pricePerKg) product.pricePerKg = Number(pricePerKg);
    if (category) product.category = category;
    if (inStock !== undefined) product.inStock = inStock === 'true' || inStock === true;
    if (isFeatured !== undefined) product.isFeatured = isFeatured === 'true' || isFeatured === true;
    if (req.files && req.files.length > 0) {
      product.images = req.files.map(f => `/uploads/${f.filename}`);
    }

    await product.save(); // triggers pre-save to recalculate prices
    res.json(product);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json({ message: 'Product deleted' });
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
};
