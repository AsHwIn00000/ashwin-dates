const express = require('express');
const router = express.Router();
const {
  getProducts, getProduct, getFeatured, getCategoryCounts,
  createProduct, updateProduct, deleteProduct,
  createProductReview,
} = require('../controllers/productController');
const { protect, adminOnly } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/', getProducts);
router.get('/featured', getFeatured);
router.get('/category-counts', getCategoryCounts);
router.get('/:id', getProduct);
router.post('/', protect, adminOnly, upload.array('images', 5), createProduct);
router.put('/:id', protect, adminOnly, upload.array('images', 5), updateProduct);
router.delete('/:id', protect, adminOnly, deleteProduct);
router.post('/:id/reviews', protect, createProductReview);

module.exports = router;
