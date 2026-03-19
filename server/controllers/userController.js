const User = require('../models/User');
const Series = require('../models/Series');
const Notification = require('../models/Notification');
const { asyncHandler } = require('../middleware/errorHandler');
const { uploadToCloudinary } = require('../config/cloudinary');
const { sendNotificationToUser } = require('../services/socketService');

// GET /api/users/profile/:id
exports.getPublicProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id)
    .select('-password -email -watchHistory -bankAccount -resetOTP -resetOTPExpiry -stripeCustomerId')
    .populate('followers', 'name avatar')
    .lean();

  if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

  let seriesCount = 0;
  if (user.role === 'creator') {
    seriesCount = await Series.countDocuments({ creatorId: user._id, status: 'live' });
  }

  res.json({ success: true, user: { ...user, seriesCount } });
});

// PUT /api/users/profile
exports.updateProfile = asyncHandler(async (req, res) => {
  const { name, bio, socialLinks, theme } = req.body;
  const updateData = {};

  if (name) updateData.name = name;
  if (bio !== undefined) updateData.bio = bio;
  if (socialLinks) updateData.socialLinks = socialLinks;
  if (theme) updateData.theme = theme;

  // Handle avatar upload
  if (req.file) {
    const result = await uploadToCloudinary(req.file.buffer, {
      folder: 'celova/avatars',
      width: 400,
      height: 400,
      crop: 'fill',
      gravity: 'face',
    });
    updateData.avatar = result.secure_url;
  }

  const user = await User.findByIdAndUpdate(req.user._id, updateData, {
    new: true,
    runValidators: true,
  });

  res.json({ success: true, message: 'Profile updated.', user });
});

// POST /api/users/follow/:id
exports.followUser = asyncHandler(async (req, res) => {
  if (req.params.id === req.user._id.toString()) {
    return res.status(400).json({ success: false, message: "You can't follow yourself." });
  }

  const targetUser = await User.findById(req.params.id);
  if (!targetUser) return res.status(404).json({ success: false, message: 'User not found.' });

  if (targetUser.followers.includes(req.user._id)) {
    return res.status(400).json({ success: false, message: 'Already following.' });
  }

  await User.findByIdAndUpdate(req.params.id, { $addToSet: { followers: req.user._id } });
  await User.findByIdAndUpdate(req.user._id, { $addToSet: { following: req.params.id } });

  // Create and send notification
  const notif = await Notification.create({
    userId: req.params.id,
    type: 'follow',
    message: `${req.user.name} started following you!`,
    link: `/creator/${req.user._id}`,
  });
  sendNotificationToUser(req.params.id, notif);

  res.json({ success: true, message: `Now following ${targetUser.name}` });
});

// DELETE /api/users/follow/:id
exports.unfollowUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(req.params.id, { $pull: { followers: req.user._id } });
  await User.findByIdAndUpdate(req.user._id, { $pull: { following: req.params.id } });
  res.json({ success: true, message: 'Unfollowed successfully.' });
});

// GET /api/users/my-list
exports.getMyList = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
    .populate({
      path: 'myList',
      match: { status: 'live' },
      select: 'title thumbnail genre rating totalViews seasons language',
    })
    .lean();

  res.json({ success: true, myList: user.myList });
});

// POST /api/users/my-list/:seriesId
exports.addToMyList = asyncHandler(async (req, res) => {
  const series = await Series.findById(req.params.seriesId);
  if (!series) return res.status(404).json({ success: false, message: 'Series not found.' });

  await User.findByIdAndUpdate(req.user._id, { $addToSet: { myList: req.params.seriesId } });
  res.json({ success: true, message: 'Added to My List.' });
});

// DELETE /api/users/my-list/:seriesId
exports.removeFromMyList = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(req.user._id, { $pull: { myList: req.params.seriesId } });
  res.json({ success: true, message: 'Removed from My List.' });
});

// PUT /api/users/watch-progress
exports.updateWatchProgress = asyncHandler(async (req, res) => {
  const { seriesId, episodeId, progress } = req.body;

  const user = await User.findById(req.user._id);
  const existingIndex = user.watchHistory.findIndex(
    (h) => h.episodeId?.toString() === episodeId
  );

  if (existingIndex !== -1) {
    user.watchHistory[existingIndex].progress = progress;
    user.watchHistory[existingIndex].watchedAt = new Date();
  } else {
    user.watchHistory.unshift({ seriesId, episodeId, progress });
    // Keep only last 100 items
    if (user.watchHistory.length > 100) {
      user.watchHistory = user.watchHistory.slice(0, 100);
    }
  }

  await user.save({ validateBeforeSave: false });
  res.json({ success: true, message: 'Watch progress updated.' });
});

// GET /api/users/watch-history
exports.getWatchHistory = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
    .populate({
      path: 'watchHistory.seriesId',
      select: 'title thumbnail genre',
    })
    .populate({
      path: 'watchHistory.episodeId',
      select: 'title seasonNumber episodeNumber duration thumbnail',
    })
    .lean();

  res.json({ success: true, watchHistory: user.watchHistory });
});

// PUT /api/users/upgrade-premium
exports.upgradePremium = asyncHandler(async (req, res) => {
  // This is called by the Stripe webhook after successful payment
  // Direct upgrade for testing purposes
  const { durationDays = 30 } = req.body;
  const expiry = new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000);

  await User.findByIdAndUpdate(req.user._id, {
    isPremium: true,
    premiumExpiry: expiry,
  });

  res.json({ success: true, message: 'Premium activated!', premiumExpiry: expiry });
});

// GET /api/users/notifications
exports.getNotifications = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const skip = (page - 1) * limit;

  const notifications = await Notification.find({ userId: req.user._id })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const unreadCount = await Notification.countDocuments({
    userId: req.user._id,
    isRead: false,
  });

  res.json({ success: true, notifications, unreadCount });
});

// PUT /api/users/notifications/read-all
exports.markAllNotificationsRead = asyncHandler(async (req, res) => {
  await Notification.updateMany(
    { userId: req.user._id, isRead: false },
    { isRead: true }
  );
  res.json({ success: true, message: 'All notifications marked as read.' });
});
