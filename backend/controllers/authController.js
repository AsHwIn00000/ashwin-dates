const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const crypto = require('crypto');
const { sendOtpEmail } = require('../utils/mailer');
const { OAuth2Client } = require('google-auth-library');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });

exports.register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { name, email, password } = req.body;
  try {
    let user = await User.findOne({ email });
    
    if (user) {
      if (user.isVerified) {
        return res.status(400).json({ message: 'Email already registered' });
      } else {
        // User exists but not verified, update name & password
        user.name = name;
        user.password = password; // pre-save hook will hash
      }
    } else {
      user = new User({ name, email, password });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otpCode = otp;
    user.otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
    user.isVerified = false; // explicitly false
    await user.save();

    try {
      await sendOtpEmail(email, otp, 'register');
    } catch (mailErr) {
      console.error('SMTP error during registration. OTP for debugging (server-side only):', otp, mailErr.message);
      return res.status(500).json({ message: 'Failed to send verification email. Please try again.' });
    }

    res.status(200).json({
      status: 'PENDING_VERIFICATION',
      email: user.email,
      message: 'Verification OTP sent successfully to your email',
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ message: err.message || 'Server error during registration' });
  }
};

exports.login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check if verified
    if (!user.isVerified) {
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      user.otpCode = otp;
      user.otpExpires = Date.now() + 10 * 60 * 1000;
      await user.save();

      const mailResult = await sendOtpEmail(email, otp, 'register');
      let message = 'Please verify your email first. A verification OTP has been sent.';
      if (mailResult && mailResult.simulated) {
        message = 'Please verify your email first. A verification OTP has been sent (Simulated mode: check server logs).';
      }

      return res.status(403).json({
        status: 'PENDING_VERIFICATION',
        email: user.email,
        message,
      });
    }

    res.json({
      token: generateToken(user._id),
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.verifyRegisterOtp = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { email, otp } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.otpCode || user.otpCode !== otp || !user.otpExpires || user.otpExpires < Date.now()) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    // Verify user
    user.isVerified = true;
    user.otpCode = undefined;
    user.otpExpires = undefined;
    await user.save();

    res.json({
      token: generateToken(user._id),
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error('verifyRegisterOtp error:', err);
    res.status(500).json({ message: 'Server error during OTP verification' });
  }
};

exports.googleLogin = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { idToken } = req.body;
  try {
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const { email, name } = payload;

    let user = await User.findOne({ email });
    if (user) {
      if (!user.isVerified) {
        user.isVerified = true;
        await user.save();
      }
    } else {
      const randPassword = crypto.randomBytes(16).toString('hex') + 'G1!';
      user = await User.create({
        name,
        email,
        password: randPassword,
        isVerified: true,
      });
    }

    res.json({
      token: generateToken(user._id),
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error('googleLogin error:', err);
    res.status(500).json({ message: 'Server error during Google Login' });
  }
};

exports.getMe = async (req, res) => {
  res.json(req.user);
};

exports.updateProfile = async (req, res) => {
  try {
    const { name, phone, address } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, phone, address },
      { new: true, runValidators: true }
    ).select('-password');
    res.json(user);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.sendOtp = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { email, purpose } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'Email not registered' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otpCode = otp;
    user.otpExpires = Date.now() + 10 * 60 * 1000;
    await user.save();

    try {
      await sendOtpEmail(email, otp, purpose);
    } catch (mailErr) {
      console.error('SMTP error during sendOtp. OTP for debugging (server-side only):', otp, mailErr.message);
      return res.status(500).json({ message: 'Failed to send OTP email. Please try again.' });
    }

    res.json({ message: 'OTP sent successfully to your email' });
  } catch (err) {
    console.error('sendOtp error:', err);
    res.status(500).json({ message: 'Server error sending OTP' });
  }
};

// NEW: Email-first sign-in flow — checks if user exists, creates new user if not, sends OTP
exports.checkOrCreateUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { email } = req.body;
  try {
    let user = await User.findOne({ email });

    if (user && user.isVerified) {
      // Existing verified user — ask frontend to show password form
      return res.json({
        status: 'EXISTING_USER',
        message: 'Welcome back! Please enter your password to continue.',
      });
    }

    // New user OR unverified user — send OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    if (!user) {
      // Auto-create new user with temporary name from email prefix
      const tempName = email.split('@')[0].replace(/[^a-zA-Z0-9 ]/g, ' ').trim() || 'User';
      const tempPassword = crypto.randomBytes(16).toString('hex') + 'Tmp1!';
      user = new User({
        name: tempName,
        email,
        password: tempPassword,
        isVerified: false,
      });
    }

    user.otpCode = otp;
    user.otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
    user.isVerified = false;
    await user.save();

    try {
      await sendOtpEmail(email, otp, 'register');
    } catch (mailErr) {
      console.error('SMTP error during checkOrCreateUser. OTP for debugging (server-side only):', otp, mailErr.message);
      return res.status(500).json({ message: 'Failed to send verification email. Please try again.' });
    }

    return res.json({
      status: 'NEW_USER',
      email: user.email,
      message: 'Verification OTP sent to your email. Please verify to sign in.',
    });
  } catch (err) {
    console.error('checkOrCreateUser error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.resetPasswordOtp = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { email, otp, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'Email not registered' });
    }

    if (!user.otpCode || user.otpCode !== otp || !user.otpExpires || user.otpExpires < Date.now()) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    user.password = password;
    user.otpCode = undefined;
    user.otpExpires = undefined;
    await user.save();

    res.json({ message: 'Password updated successfully! You can now log in.' });
  } catch (err) {
    console.error('resetPasswordOtp error:', err);
    res.status(500).json({ message: 'Server error resetting password' });
  }
};
