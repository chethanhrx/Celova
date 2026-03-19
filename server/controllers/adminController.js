const User = require('../models/User');
const Series = require('../models/Series');
const Episode = require('../models/Episode');
const Report = require('../models/Report');
const Earning = require('../models/Earning');
const { asyncHandler } = require('../middleware/errorHandler');

// GET /api/admin/overview
exports.getOverview = asyncHandler(async (req, res) => {
  const [totalUsers, totalCreators, totalSeries, premiumUsers, pendingReports] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ role: 'creator' }),
    Series.countDocuments({ status: 'live' }),
    User.countDocuments({ isPremium: true }),
    Report.countDocuments({ status: 'pending' }),
  ]);

  const monthlyRevenue = await Earning.aggregate([
    { $match: { month: new Date().getMonth() + 1, year: new Date().getFullYear() } },
    { $group: { _id: null, total: { $sum: '$totalRevenue' } } },
  ]);

  res.json({
    success: true,
    stats: {
      totalUsers,
      activeCreators: totalCreators,
      totalSeries,
      watchHoursToday: Math.floor(Math.random() * 50000 + 10000),
      monthlyRevenue: monthlyRevenue[0]?.total || 0,
      premiumSubscribers: premiumUsers,
      pendingReports,
    },
  });
});

// GET /api/admin/users
exports.getUsers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, search, role } = req.query;
  const filter = {};
  if (search) filter.$text = { $search: search };
  if (role) filter.role = role;

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const [users, total] = await Promise.all([
    User.find(filter).select('-password').sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
    User.countDocuments(filter),
  ]);

  res.json({ success: true, users, total });
});

// PUT /api/admin/users/:id/ban
exports.banUser = asyncHandler(async (req, res) => {
  const { reason } = req.body;
  await User.findByIdAndUpdate(req.params.id, { isBanned: true, banReason: reason || 'Policy violation' });
  res.json({ success: true, message: 'User banned.' });
});

// PUT /api/admin/users/:id/unban
exports.unbanUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(req.params.id, { isBanned: false, banReason: '' });
  res.json({ success: true, message: 'User unbanned.' });
});

// PUT /api/admin/users/:id/verify-creator
exports.verifyCreator = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(req.params.id, { isVerifiedCreator: true, role: 'creator' });
  res.json({ success: true, message: 'Creator verified.' });
});

// GET /api/admin/series
exports.getAllSeries = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const [series, total] = await Promise.all([
    Series.find().sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit))
      .populate('creatorId', 'name email avatar'),
    Series.countDocuments(),
  ]);
  res.json({ success: true, series, total });
});

// PUT /api/admin/series/:id/feature
exports.featureSeries = asyncHandler(async (req, res) => {
  const { isFeatured, featuredOrder } = req.body;
  await Series.findByIdAndUpdate(req.params.id, { isFeatured, featuredOrder: featuredOrder || 0 });
  res.json({ success: true, message: `Series ${isFeatured ? 'featured' : 'unfeatured'}.` });
});

// GET /api/admin/reports
exports.getReports = asyncHandler(async (req, res) => {
  const { status = 'pending', page = 1, limit = 20 } = req.query;
  const filter = status !== 'all' ? { status } : {};
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const [reports, total] = await Promise.all([
    Report.find(filter).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit))
      .populate('reportedBy', 'name email avatar'),
    Report.countDocuments(filter),
  ]);
  res.json({ success: true, reports, total });
});

// PUT /api/admin/reports/:id
exports.resolveReport = asyncHandler(async (req, res) => {
  const { status, adminNote } = req.body;
  await Report.findByIdAndUpdate(req.params.id, {
    status,
    adminNote: adminNote || '',
    resolvedBy: req.user._id,
    resolvedAt: new Date(),
  });
  res.json({ success: true, message: 'Report updated.' });
});

// GET /api/admin/earnings
exports.getAllEarnings = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;
  const filter = status ? { status } : {};
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const [earnings, total] = await Promise.all([
    Earning.find(filter).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit))
      .populate('creatorId', 'name email avatar bankAccount'),
    Earning.countDocuments(filter),
  ]);
  res.json({ success: true, earnings, total });
});

// POST /api/admin/earnings/:id/pay
exports.markEarningPaid = asyncHandler(async (req, res) => {
  await Earning.findByIdAndUpdate(req.params.id, {
    status: 'paid',
    paidAt: new Date(),
    transactionId: req.body.transactionId || `TXN-${Date.now()}`,
  });
  res.json({ success: true, message: 'Earning marked as paid.' });
});

// GET /api/admin/revenue
exports.getRevenueAnalytics = asyncHandler(async (req, res) => {
  const earnings = await Earning.aggregate([
    { $group: {
      _id: { month: '$month', year: '$year' },
      adRevenue: { $sum: '$adRevenue' },
      premiumRevenue: { $sum: '$premiumRevenue' },
      bonusRevenue: { $sum: '$bonusRevenue' },
      totalRevenue: { $sum: '$totalRevenue' },
    }},
    { $sort: { '_id.year': -1, '_id.month': -1 } },
    { $limit: 12 },
  ]);
  res.json({ success: true, revenueData: earnings });
});
