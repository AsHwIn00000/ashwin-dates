const Order = require('../models/Order');
const Product = require('../models/Product');
const PDFDocument = require('pdfkit');
const { sendOrderNotificationToAdmin } = require('../utils/mailer');

// SMS notification helper
const sendAdminSMS = async (message) => {
  try {
    if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) return;
    const twilio = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    await twilio.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE,
      to: process.env.ADMIN_PHONE || '+919442114559',
    });
  } catch (err) {
    console.error('SMS failed:', err.message); // don't crash the order
  }
};

const BRAND_COLOR = '#360B5E';
const BRAND_NAME = 'Ashwin Dates & Dry Fruits';
const SUPPORT_EMAIL = 'preamkumar.t.m1978@gmail.com';
const SUPPORT_PHONE = '+91 9442114559';

const getWeightInKg = (weightStr) => {
  if (!weightStr) return 0.5;
  const match = weightStr.match(/^(\d+(?:\.\d+)?)\s*(g|kg)$/i);
  if (!match) return 0.5;
  const val = parseFloat(match[1]);
  const unit = match[2].toLowerCase();
  if (unit === 'kg') return val;
  if (unit === 'g') return val / 1000;
  return 0.5;
};

const calculatePriceForWeight = (product, weightStr) => {
  if (product.prices && product.prices[weightStr] !== undefined && product.prices[weightStr] > 0) {
    return product.prices[weightStr];
  }
  const basePricePerKg = product.pricePerKg || 0;
  const weightInKg = getWeightInKg(weightStr);
  return Math.round(basePricePerKg * weightInKg);
};

const generateOrderNumber = () => {
  const randomNum = Math.floor(100000 + Math.random() * 900000);
  return `ORD-${randomNum}`;
};

exports.createOrder = async (req, res) => {
  try {
    if (req.user && req.user.role === 'admin') {
      return res.status(403).json({ message: 'Admins are not allowed to place orders' });
    }

    const { products, shippingAddress, paymentMethod } = req.body;

    let itemsPrice = 0;
    let totalWeight = 0;
    const orderProducts = [];

    for (const item of products) {
      const product = await Product.findById(item.productId);
      if (!product) return res.status(404).json({ message: `Product not found: ${item.productId}` });
      if (!product.inStock) return res.status(400).json({ message: `${product.name} is out of stock` });

      const weight = item.weight || '500g';
      const price = calculatePriceForWeight(product, weight);
      itemsPrice += price * item.quantity;
      totalWeight += getWeightInKg(weight) * item.quantity;

      orderProducts.push({
        productId: product._id,
        name: product.name,
        weight,
        price,
        quantity: item.quantity,
        image: product.images[0] || '',
      });
    }

    const shippingPrice = Math.round(totalWeight * 90);
    const totalAmount = itemsPrice + shippingPrice;
    const orderNumber = generateOrderNumber();

    const order = await Order.create({
      orderNumber,
      userId: req.user._id,
      products: orderProducts,
      shippingAddress,
      itemsPrice,
      shippingPrice,
      totalAmount,
      paymentMethod,
      paymentStatus: 'pending',
      orderStatus: 'processing',
    });

    // Notify admin via SMS & Email
    const itemsSummary = orderProducts.map(p => `${p.name} (${p.weight} x${p.quantity})`).join(', ');
    const displayId = order.orderNumber || (`ORD-${order._id.toString().slice(-6).toUpperCase()}`);

    await sendAdminSMS(
      `🛒 New Order!\nCustomer: ${shippingAddress.name}\nPhone: ${shippingAddress.phone}\nItems: ${itemsSummary}\nTotal: ₹${totalAmount}\nPayment: ${paymentMethod.toUpperCase()}\nOrder ID: ${displayId}`
    );

    // Notify admin via Email
    sendOrderNotificationToAdmin(order, shippingAddress, orderProducts).catch(err => 
      console.error('Error in sendOrderNotificationToAdmin:', err.message)
    );

    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('userId', 'name email');
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (order.userId._id.toString() !== req.user._id.toString() && req.user.role !== 'admin')
      return res.status(403).json({ message: 'Not authorized' });
    res.json(order);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.generateOrderPDF = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('userId', 'name email phone');
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (order.userId._id.toString() !== req.user._id.toString() && req.user.role !== 'admin')
      return res.status(403).json({ message: 'Not authorized' });

    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=order-${order.orderNumber || order._id}.pdf`);
    doc.pipe(res);

    // ── Header band ──────────────────────────────────────────────
    doc.rect(0, 0, 595, 80).fill(BRAND_COLOR);
    doc.fontSize(22).fillColor('#ffffff').text(BRAND_NAME, 50, 22, { align: 'center' });
    doc.fontSize(10).fillColor('#d8b4fe').text('Order Invoice', 50, 50, { align: 'center' });

    doc.moveDown(3);

    // ── Order meta ───────────────────────────────────────────────
    doc.fontSize(11).fillColor('#333');
    const metaY = 100;
    const displayOrderId = order.orderNumber || (`ORD-${order._id.toString().slice(-6).toUpperCase()}`);
    doc.text(`Order ID:`, 50, metaY).fillColor(BRAND_COLOR).text(displayOrderId, 130, metaY);
    doc.fillColor('#333').text(`Date:`, 50, metaY + 18)
      .text(new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }), 130, metaY + 18);
    doc.text(`Status:`, 50, metaY + 36).fillColor('#16a34a').text(order.orderStatus.toUpperCase(), 130, metaY + 36);
    doc.fillColor('#333').text(`Payment:`, 50, metaY + 54)
      .text(`${order.paymentMethod.toUpperCase()} — ${order.paymentStatus.toUpperCase()}`, 130, metaY + 54);

    // ── Divider ──────────────────────────────────────────────────
    doc.moveTo(50, metaY + 78).lineTo(545, metaY + 78).strokeColor(BRAND_COLOR).lineWidth(1).stroke();

    // ── Shipping address ─────────────────────────────────────────
    const addrY = metaY + 90;
    doc.fontSize(12).fillColor(BRAND_COLOR).text('Shipping Address', 50, addrY);
    doc.fontSize(10).fillColor('#333')
      .text(`${order.shippingAddress.name}`, 50, addrY + 18)
      .text(`${order.shippingAddress.phone}`, 50, addrY + 32)
      .text(`${order.shippingAddress.street}, ${order.shippingAddress.city}`, 50, addrY + 46)
      .text(`${order.shippingAddress.state} — ${order.shippingAddress.pincode}`, 50, addrY + 60);

    // ── Items table ──────────────────────────────────────────────
    const tblY = addrY + 90;
    doc.fontSize(12).fillColor(BRAND_COLOR).text('Order Items', 50, tblY);

    const rowH = 22;
    const hdrY = tblY + 18;
    doc.rect(50, hdrY, 495, rowH).fill(BRAND_COLOR);
    doc.fontSize(9).fillColor('#fff')
      .text('Product', 58, hdrY + 7)
      .text('Weight', 290, hdrY + 7)
      .text('Qty', 360, hdrY + 7)
      .text('Unit Price', 400, hdrY + 7)
      .text('Total', 470, hdrY + 7);

    let rowY = hdrY + rowH;
    order.products.forEach((item, i) => {
      const bg = i % 2 === 0 ? '#f5f0ff' : '#ffffff';
      doc.rect(50, rowY, 495, rowH).fill(bg);
      doc.fontSize(9).fillColor('#333')
        .text(item.name, 58, rowY + 7, { width: 225, ellipsis: true })
        .text(item.weight || '—', 290, rowY + 7)
        .text(String(item.quantity), 360, rowY + 7)
        .text(`Rs.${item.price}`, 400, rowY + 7)
        .text(`Rs.${item.price * item.quantity}`, 470, rowY + 7);
      rowY += rowH;
    });

    // ── Total row ────────────────────────────────────────────────
    rowY += 6;
    doc.moveTo(50, rowY).lineTo(545, rowY).strokeColor(BRAND_COLOR).lineWidth(0.5).stroke();
    rowY += 8;
    const subtotal = order.itemsPrice || (order.totalAmount - (order.shippingPrice || 0));
    const shipping = order.shippingPrice || 0;
    doc.fontSize(10).fillColor('#333')
      .text(`Subtotal:  Rs.${subtotal}`, 50, rowY, { align: 'right', width: 495 });
    rowY += 14;
    doc.text(`Shipping Fee:  Rs.${shipping}`, 50, rowY, { align: 'right', width: 495 });
    rowY += 16;
    doc.fontSize(12).fillColor(BRAND_COLOR)
      .text(`Grand Total:  Rs.${order.totalAmount}`, 50, rowY, { align: 'right', width: 495 });

    // ── Footer ───────────────────────────────────────────────────
    rowY += 40;
    doc.moveTo(50, rowY).lineTo(545, rowY).strokeColor('#e5e7eb').lineWidth(0.5).stroke();
    rowY += 12;
    doc.fontSize(9).fillColor('#888')
      .text(`Thank you for shopping with ${BRAND_NAME}!`, 50, rowY, { align: 'center', width: 495 });
    doc.text(`Support: ${SUPPORT_EMAIL}  |  ${SUPPORT_PHONE}`, 50, rowY + 14, { align: 'center', width: 495 });

    doc.end();
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().populate('userId', 'name email').sort({ createdAt: -1 });
    res.json(orders);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.cancelPendingOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (order.userId.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Not authorized' });
    // only cancel if still pending (not paid)
    if (order.paymentStatus === 'paid')
      return res.status(400).json({ message: 'Cannot cancel a paid order' });
    await Order.findByIdAndDelete(req.params.id);
    res.json({ message: 'Order cancelled' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { orderStatus } = req.body;
    const order = await Order.findByIdAndUpdate(req.params.id, { orderStatus }, { new: true });
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.cancelOrder = async (req, res) => {
  try {
    const { reason } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (order.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    order.orderStatus = 'cancelled';
    order.cancelReason = reason || 'Cancelled by customer';
    await order.save();
    res.json({ message: 'Order cancelled successfully', order });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.returnOrder = async (req, res) => {
  try {
    const { reason } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (order.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    if (order.orderStatus !== 'delivered') {
      return res.status(400).json({ message: 'Only delivered orders can be returned' });
    }
    order.orderStatus = 'return_requested';
    order.returnReason = reason || 'Return requested by customer';
    await order.save();
    res.json({ message: 'Return requested successfully', order });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
