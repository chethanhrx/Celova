const Series = require('../models/Series');
const Episode = require('../models/Episode');
const User = require('../models/User');
const { asyncHandler } = require('../middleware/errorHandler');
const { uploadToCloudinary, deleteFromCloudinary } = require('../config/cloudinary');

// GET /api/series — list with filters & pagination
exports.getSeries = asyncHandler(async (req, res) => {
  const { genre, language, status = 'live', sort = 'newest', page = 1, limit = 20, search } = req.query;
  const filter = { status };
  if (genre) filter.genre = genre;
  if (language) filter.language = language;
  if (search) filter.$text = { $search: search };

  const sortMap = {
    newest: { createdAt: -1 },
    views: { totalViews: -1 },
    rating: { rating: -1 },
    trending: { trendingScore: -1 },
  };
  const sortOption = sortMap[sort] || sortMap.newest;

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const [series, total] = await Promise.all([
    Series.find(filter)
      .sort(sortOption)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('creatorId', 'name avatar isVerifiedCreator'),
    Series.countDocuments(filter),
  ]);

  res.json({ success: true, series, total, page: parseInt(page), pages: Math.ceil(total / limit) });
});

// GET /api/series/featured
exports.getFeatured = asyncHandler(async (req, res) => {
  const series = await Series.find({ isFeatured: true, status: 'live' })
    .sort({ featuredOrder: 1 })
    .limit(5)
    .populate('creatorId', 'name avatar');
  res.json({ success: true, series });
});

// GET /api/series/top10
exports.getTop10 = asyncHandler(async (req, res) => {
  const series = await Series.find({ status: 'live' })
    .sort({ trendingScore: -1 })
    .limit(10)
    .populate('creatorId', 'name avatar');
  res.json({ success: true, series });
});

// GET /api/series/trending
exports.getTrending = asyncHandler(async (req, res) => {
  const series = await Series.find({ status: 'live' })
    .sort({ weeklyViews: -1, rating: -1 })
    .limit(20)
    .populate('creatorId', 'name avatar');
  res.json({ success: true, series });
});

// GET /api/series/:id
exports.getSeriesById = asyncHandler(async (req, res) => {
  const series = await Series.findById(req.params.id)
    .populate('creatorId', 'name avatar bio isVerifiedCreator followers');
  if (!series) return res.status(404).json({ success: false, message: 'Series not found.' });
  res.json({ success: true, series });
});

// POST /api/series
exports.createSeries = asyncHandler(async (req, res) => {
  const { title, description, genre, language, tags, ageRating, availableLanguages } = req.body;

  let thumbnail = '';
  let thumbnailPublicId = '';
  if (req.file) {
    const result = await uploadToCloudinary(req.file.buffer, {
      folder: 'celova/thumbnails',
      width: 1280,
      height: 720,
      crop: 'fill',
    });
    thumbnail = result.secure_url;
    thumbnailPublicId = result.public_id;
  }

  const series = await Series.create({
    title,
    description,
    genre,
    language,
    tags: tags ? (Array.isArray(tags) ? tags : tags.split(',').map((t) => t.trim())) : [],
    ageRating: ageRating || 'U',
    availableLanguages: availableLanguages || [language],
    thumbnail,
    thumbnailPublicId,
    creatorId: req.user._id,
  });

  res.status(201).json({ success: true, message: 'Series created!', series });
});

// PUT /api/series/:id
exports.updateSeries = asyncHandler(async (req, res) => {
  const series = await Series.findById(req.params.id);
  if (!series) return res.status(404).json({ success: false, message: 'Series not found.' });

  const isOwner = series.creatorId.toString() === req.user._id.toString();
  if (!isOwner && req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Not authorized.' });
  }

  const updates = { ...req.body };
  if (req.file) {
    if (series.thumbnailPublicId) await deleteFromCloudinary(series.thumbnailPublicId);
    const result = await uploadToCloudinary(req.file.buffer, {
      folder: 'celova/thumbnails', width: 1280, height: 720, crop: 'fill',
    });
    updates.thumbnail = result.secure_url;
    updates.thumbnailPublicId = result.public_id;
  }

  const updated = await Series.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
  res.json({ success: true, message: 'Series updated.', series: updated });
});

// DELETE /api/series/:id
exports.deleteSeries = asyncHandler(async (req, res) => {
  const series = await Series.findById(req.params.id);
  if (!series) return res.status(404).json({ success: false, message: 'Series not found.' });

  const isOwner = series.creatorId.toString() === req.user._id.toString();
  if (!isOwner && req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Not authorized.' });
  }

  if (series.thumbnailPublicId) await deleteFromCloudinary(series.thumbnailPublicId);
  await Episode.deleteMany({ seriesId: series._id });
  await series.deleteOne();

  res.json({ success: true, message: 'Series deleted.' });
});

// GET /api/series/creator/:creatorId
exports.getSeriesByCreator = asyncHandler(async (req, res) => {
  const { page = 1, limit = 12 } = req.query;
  const filter = { creatorId: req.params.creatorId };
  // Non-owners only see live series
  if (!req.user || req.user._id.toString() !== req.params.creatorId) {
    filter.status = 'live';
  }
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const [series, total] = await Promise.all([
    Series.find(filter).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
    Series.countDocuments(filter),
  ]);
  res.json({ success: true, series, total });
});
