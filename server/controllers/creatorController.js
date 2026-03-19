const Series = require('../models/Series');
const Episode = require('../models/Episode');
const User = require('../models/User');
const Earning = require('../models/Earning');
const { asyncHandler } = require('../middleware/errorHandler');

// GET /api/creator/dashboard
exports.getDashboard = asyncHandler(async (req, res) => {
  const creatorId = req.user._id;

  const [seriesCount, allSeries, followers, currentMonth] = await Promise.all([
    Series.countDocuments({ creatorId }),
    Series.find({ creatorId }).select('totalViews totalEpisodes rating'),
    User.findById(creatorId).select('followers').lean(),
    Earning.findOne({
      creatorId,
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear(),
    }),
  ]);

  const totalViews = allSeries.reduce((acc, s) => acc + s.totalViews, 0);
  const avgRating = allSeries.length
    ? (allSeries.reduce((acc, s) => acc + s.rating, 0) / allSeries.length).toFixed(1)
    : 0;

  // Daily views for last 14 days (mocked aggregation)
  const viewsHistory = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    viewsHistory.push({
      date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      views: Math.floor(Math.random() * 5000 + 500),
    });
  }

  res.json({
    success: true,
    stats: {
      totalViews,
      monthlyEarnings: currentMonth?.totalRevenue || 0,
      followers: followers?.followers?.length || 0,
      avgRating: parseFloat(avgRating),
      seriesCount,
    },
    viewsHistory,
  });
});

// GET /api/creator/analytics
exports.getAnalytics = asyncHandler(async (req, res) => {
  const { period = '30d' } = req.query;
  const days = period === '7d' ? 7 : period === '90d' ? 90 : 30;

  const viewsData = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    viewsData.push({
      date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      views: Math.floor(Math.random() * 8000 + 1000),
      watchTime: Math.floor(Math.random() * 40000 + 5000),
    });
  }

  res.json({
    success: true,
    viewsData,
    trafficSources: [
      { source: 'Homepage', value: 45 },
      { source: 'Browse', value: 25 },
      { source: 'Search', value: 15 },
      { source: 'Direct', value: 10 },
      { source: 'Other', value: 5 },
    ],
    demographics: {
      languages: [
        { lang: 'English', pct: 40 }, { lang: 'Hindi', pct: 30 },
        { lang: 'Japanese', pct: 15 }, { lang: 'Other', pct: 15 },
      ],
    },
  });
});

// GET /api/creator/earnings
exports.getEarnings = asyncHandler(async (req, res) => {
  const earnings = await Earning.find({ creatorId: req.user._id })
    .sort({ year: -1, month: -1 })
    .limit(24);

  const available = earnings
    .filter((e) => e.status === 'pending')
    .reduce((sum, e) => sum + e.totalRevenue, 0);

  res.json({ success: true, earnings, available });
});

// POST /api/creator/earnings/withdraw
exports.requestWithdrawal = asyncHandler(async (req, res) => {
  // In real app: create withdrawal request in DB and trigger bank transfer
  res.json({ success: true, message: 'Withdrawal request submitted. Processing in 3-5 days.' });
});

// GET /api/creator/followers
exports.getFollowers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const user = await User.findById(req.user._id)
    .populate({
      path: 'followers',
      select: 'name avatar createdAt',
      options: { skip: (parseInt(page) - 1) * parseInt(limit), limit: parseInt(limit) },
    })
    .lean();

  res.json({ success: true, followers: user.followers, total: user.followers?.length || 0 });
});
