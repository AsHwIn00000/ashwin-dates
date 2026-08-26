const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { register, login, getMe, updateProfile, sendOtp, resetPasswordOtp, verifyRegisterOtp, googleLogin, checkOrCreateUser } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

const passwordRules = body('password')
  .isLength({ min: 6 }).withMessage('Password must be at least 6 characters');

router.post('/register', [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email required').normalizeEmail(),
  passwordRules,
], register);

router.post('/login', [
  body('email').isEmail().withMessage('Valid email required').normalizeEmail(),
  body('password').notEmpty().withMessage('Password required'),
], login);

router.post('/send-otp', [
  body('email').isEmail().withMessage('Valid email required').normalizeEmail(),
  body('purpose').isIn(['forgot-password', 'register']).withMessage('Invalid purpose'),
], sendOtp);

// Email-first login flow: check if new or existing user
router.post('/check-email', [
  body('email').isEmail().withMessage('Valid email required').normalizeEmail(),
], checkOrCreateUser);

router.post('/verify-register-otp', [
  body('email').isEmail().withMessage('Valid email required').normalizeEmail(),
  body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits'),
], verifyRegisterOtp);

router.post('/google-login', [
  body('idToken').trim().notEmpty().withMessage('ID Token is required'),
], googleLogin);

router.post('/reset-password-otp', [
  body('email').isEmail().withMessage('Valid email required').normalizeEmail(),
  body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits'),
  passwordRules,
], resetPasswordOtp);

router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);

module.exports = router;
