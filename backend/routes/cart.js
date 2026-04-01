// Cart is managed client-side (localStorage) for performance.
// This route is a placeholder for future server-side cart if needed.
const express = require('express');
const router = express.Router();
router.get('/', (req, res) => res.json({ message: 'Cart managed client-side' }));
module.exports = router;
