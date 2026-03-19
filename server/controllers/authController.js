const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const { asyncHandler } = require('../middleware/errorHandler');
const { sendPasswordResetOTP, sendWelcomeEmail } = require('../services/emailService');

/** Generate JWT Access Token (15 min) */
const generateAccessToken = (id) =>
  jwt.sign({ id }, process.env.JWT_ACCESS_SECRET, { expiresIn: '15m' });

/** Generate JWT Refresh Token (7 days) */
const generateRefreshToken = (id) =>
  jwt.sign({ id }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });

/** Set refresh token as HTTP-only cookie */
const setRefreshCookie = (res, token) => {
  res.cookie('refreshToken', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
};

// POST /api/auth/register
exports.register = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  // Only allow viewer/creator on register — admin is set manually
  const allowedRoles = ['viewer', 'creator'];
  const userRole = allowedRoles.includes(role) ? role : 'viewer';

  const existing = await User.findOne({ email });
  if (existing) {
    return res.status(409).json({ success: false, message: 'Email already registered.' });
  }

  const user = await User.create({ name, email, password, role: userRole });

  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);
  setRefreshCookie(res, refreshToken);

  // Send welcome email (non-blocking)
  sendWelcomeEmail(email, name, userRole).catch(() => {});

  res.status(201).json({
    success: true,
    message: 'Account created successfully!',
    accessToken,
    user: user.toJSON(),
  });
});

// POST /api/auth/login
exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    return res.status(401).json({ success: false, message: 'Invalid email or password.' });
  }

  if (user.isBanned) {
    return res.status(403).json({
      success: false,
      message: `Account banned: ${user.banReason || 'Terms violation.'}`,
    });
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    return res.status(401).json({ success: false, message: 'Invalid email or password.' });
  }

  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);
  setRefreshCookie(res, refreshToken);

  res.json({
    success: true,
    message: 'Logged in successfully!',
    accessToken,
    user: user.toJSON(),
  });
});

// POST /api/auth/logout
exports.logout = asyncHandler(async (req, res) => {
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  });
  res.json({ success: true, message: 'Logged out successfully.' });
});

// POST /api/auth/refresh
exports.refresh = asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken;
  if (!token) {
    return res.status(401).json({ success: false, message: 'No refresh token found.' });
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
  } catch {
    return res.status(401).json({ success: false, message: 'Invalid or expired refresh token.' });
  }

  const user = await User.findById(decoded.id);
  if (!user || user.isBanned) {
    return res.status(401).json({ success: false, message: 'User not found or banned.' });
  }

  const accessToken = generateAccessToken(user._id);
  const newRefreshToken = generateRefreshToken(user._id);
  setRefreshCookie(res, newRefreshToken);

  res.json({ success: true, accessToken });
});

// POST /api/auth/forgot-password
exports.forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  // Always return 200 to prevent email enumeration
  if (!user) {
    return res.json({ success: true, message: 'If that email exists, an OTP has been sent.' });
  }

  // Generate 6-digit OTP
  const otp = crypto.randomInt(100000, 999999).toString();
  const expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  user.resetOTP = otp;
  user.resetOTPExpiry = expiry;
  await user.save({ validateBeforeSave: false });

  await sendPasswordResetOTP(user.email, otp, user.name);

  res.json({ success: true, message: 'If that email exists, an OTP has been sent.' });
});

// POST /api/auth/reset-password
exports.resetPassword = asyncHandler(async (req, res) => {
  const { email, otp, newPassword } = req.body;

  const user = await User.findOne({
    email,
    resetOTP: otp,
    resetOTPExpiry: { $gt: Date.now() },
  });

  if (!user) {
    return res.status(400).json({ success: false, message: 'Invalid or expired OTP.' });
  }

  user.password = newPassword;
  user.resetOTP = undefined;
  user.resetOTPExpiry = undefined;
  await user.save();

  res.json({ success: true, message: 'Password reset successfully. Please log in.' });
});

// GET /api/auth/me
exports.getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
    .populate('myList', 'title thumbnail rating genre')
    .lean();

  res.json({ success: true, user });
});
