const Product = require('../models/Product');

exports.getProducts = async (req, res) => {
  try {
    const { category, search, page = 1, limit = 12, sort } = req.query;
    const query = {};
    if (category && category !== 'all') {
      const cats = category.split(',');
      query.category = cats.length > 1 ? { $in: cats } : category;
    }
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

exports.getCategoryCounts = async (req, res) => {
  try {
    const rawCounts = await Product.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } }
    ]);

    const countMap = {};
    rawCounts.forEach(item => {
      if (item._id) countMap[item._id] = item.count;
    });

    const datesCount = countMap['dates'] || 0;
    const dryFruitsCount = (countMap['almonds'] || 0) + (countMap['cashews'] || 0) + (countMap['pistachios'] || 0) + (countMap['dry-fruits'] || 0);
    const nutsCount = (countMap['almonds'] || 0) + (countMap['cashews'] || 0) + (countMap['pistachios'] || 0);
    const spicesCount = countMap['spices'] || 0;
    const comboCount = countMap['combo'] || 0;
    const seedsCount = countMap['seeds'] || 0;
    const beveragesCount = (countMap['essence'] || 0) + (countMap['beverages-syrups'] || 0);
    const honeyCount = countMap['others'] || 0;
    const sweetsCount = countMap['others'] || 0;

    res.json({
      dates: datesCount,
      'dry-fruits': dryFruitsCount,
      almonds: nutsCount,
      spices: spicesCount,
      combo: comboCount,
      seeds: seedsCount,
      'beverages-syrups': beveragesCount,
      others: honeyCount,
      raw: countMap
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error fetching category counts' });
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

exports.createProductReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Please provide a rating between 1 and 5' });
    }
    if (!comment || !comment.trim()) {
      return res.status(400).json({ message: 'Please provide a comment' });
    }

    const alreadyReviewed = product.reviews?.find(
      r => r.userId.toString() === req.user._id.toString()
    );
    if (alreadyReviewed) {
      return res.status(400).json({ message: 'Product already reviewed by you' });
    }

    const review = {
      userId: req.user._id,
      name: req.user.name,
      rating: Number(rating),
      comment: comment.trim(),
    };

    product.reviews.push(review);
    product.numReviews = product.reviews.length;
    product.rating = product.reviews.reduce((acc, r) => acc + r.rating, 0) / product.reviews.length;

    await product.save();
    res.status(201).json({ message: 'Review added successfully', product });
  } catch (err) {
    res.status(500).json({ message: err.message || 'Server error adding review' });
  }
};
