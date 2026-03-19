const Rating = require('../models/Rating');
const Series = require('../models/Series');
const { asyncHandler } = require('../middleware/errorHandler');

// POST /api/ratings — add or update
exports.upsertRating = asyncHandler(async (req, res) => {
  const { seriesId, episodeId, stars, review } = req.body;

  const filter = { userId: req.user._id };
  if (seriesId) filter.seriesId = seriesId;
  else if (episodeId) filter.episodeId = episodeId;

  const rating = await Rating.findOneAndUpdate(
    filter,
    { stars, review: review || '', userId: req.user._id, seriesId, episodeId },
    { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true }
  );

  // Recalculate series average rating
  if (seriesId) {
    const stats = await Rating.aggregate([
      { $match: { seriesId: require('mongoose').Types.ObjectId.createFromHexString(seriesId) } },
      { $group: { _id: null, avg: { $avg: '$stars' }, count: { $sum: 1 } } },
    ]);
    if (stats.length) {
      await Series.findByIdAndUpdate(seriesId, {
        rating: Math.round(stats[0].avg * 10) / 10,
        totalRatings: stats[0].count,
      });
    }
  }

  res.json({ success: true, rating });
});

// GET /api/ratings/series/:seriesId
exports.getSeriesRatings = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const ratings = await Rating.find({ seriesId: req.params.seriesId })
    .populate('userId', 'name avatar')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(parseInt(limit));
  res.json({ success: true, ratings });
});

// GET /api/ratings/episode/:episodeId
exports.getEpisodeRatings = asyncHandler(async (req, res) => {
  const ratings = await Rating.find({ episodeId: req.params.episodeId })
    .populate('userId', 'name avatar')
    .sort({ createdAt: -1 })
    .limit(20);
  res.json({ success: true, ratings });
});
