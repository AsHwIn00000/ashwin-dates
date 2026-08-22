const express = require('express');
const router = express.Router();
const {
  createOrder, getMyOrders, getOrder,
  generateOrderPDF, getAllOrders, updateOrderStatus, cancelPendingOrder,
  cancelOrder, returnOrder,
} = require('../controllers/orderController');
const { protect, adminOnly } = require('../middleware/auth');

router.post('/', protect, createOrder);
router.get('/my', protect, getMyOrders);
router.get('/all', protect, adminOnly, getAllOrders);
router.get('/:id', protect, getOrder);
router.get('/:id/pdf', protect, generateOrderPDF);
router.put('/:id/status', protect, adminOnly, updateOrderStatus);
router.delete('/:id/pending', protect, cancelPendingOrder);
router.post('/:id/cancel', protect, cancelOrder);
router.post('/:id/return', protect, returnOrder);

module.exports = router;
