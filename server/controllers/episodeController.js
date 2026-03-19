const Episode = require('../models/Episode');
const Series = require('../models/Series');
const Notification = require('../models/Notification');
const User = require('../models/User');
const { asyncHandler } = require('../middleware/errorHandler');
const { uploadToCloudinary } = require('../config/cloudinary');
const { sendNotificationToUser } = require('../services/socketService');

// GET /api/episodes/series/:seriesId
exports.getEpisodesBySeries = asyncHandler(async (req, res) => {
  const { season } = req.query;
  const filter = { seriesId: req.params.seriesId, status: 'live' };
  if (season) filter.seasonNumber = parseInt(season);

  const episodes = await Episode.find(filter)
    .sort({ seasonNumber: 1, episodeNumber: 1 });

  res.json({ success: true, episodes });
});

// GET /api/episodes/:id
exports.getEpisodeById = asyncHandler(async (req, res) => {
  const episode = await Episode.findById(req.params.id)
    .populate('seriesId', 'title thumbnail genre language ageRating creatorId');
  if (!episode) return res.status(404).json({ success: false, message: 'Episode not found.' });
  res.json({ success: true, episode });
});

// POST /api/episodes
exports.createEpisode = asyncHandler(async (req, res) => {
  const {
    seriesId, seasonNumber, episodeNumber, title, description,
    language, youtubeVideoId, duration, introEnd, chapters, scheduledAt,
  } = req.body;

  // Verify creator owns this series
  const series = await Series.findById(seriesId);
  if (!series) return res.status(404).json({ success: false, message: 'Series not found.' });
  if (series.creatorId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Not authorized.' });
  }

  let thumbnail = '';
  let thumbnailPublicId = '';
  if (req.file) {
    const result = await uploadToCloudinary(req.file.buffer, {
      folder: 'celova/episode-thumbnails', width: 640, height: 360, crop: 'fill',
    });
    thumbnail = result.secure_url;
    thumbnailPublicId = result.public_id;
  }

  const status = scheduledAt ? 'scheduled' : (youtubeVideoId ? 'live' : 'draft');

  const episode = await Episode.create({
    seriesId, seasonNumber: parseInt(seasonNumber), episodeNumber: parseInt(episodeNumber),
    title, description, language, youtubeVideoId: youtubeVideoId || '',
    duration: duration ? parseInt(duration) : 0,
    introEnd: introEnd ? parseInt(introEnd) : 90,
    chapters: chapters ? JSON.parse(chapters) : [],
    thumbnail, thumbnailPublicId, status,
    scheduledAt: scheduledAt || null,
    publishedAt: status === 'live' ? new Date() : null,
    uploadStatus: 'completed',
  });

  // Update series episode count and seasons
  await Series.findByIdAndUpdate(seriesId, {
    $inc: { totalEpisodes: 1 },
    $max: { seasons: parseInt(seasonNumber) },
    ...(status === 'live' ? { status: 'live' } : {}),
  });

  // Notify followers if going live
  if (status === 'live') {
    const followers = await User.find({
      following: series.creatorId,
      'notificationPrefs.newEpisode': true,
    }).select('_id');

    for (const follower of followers) {
      const notif = await Notification.create({
        userId: follower._id,
        type: 'new_episode',
        message: `New episode of "${series.title}": ${title}`,
        link: `/watch/${episode._id}`,
      });
      sendNotificationToUser(follower._id.toString(), notif);
    }
  }

  res.status(201).json({ success: true, message: 'Episode created!', episode });
});

// PUT /api/episodes/:id
exports.updateEpisode = asyncHandler(async (req, res) => {
  const episode = await Episode.findById(req.params.id).populate('seriesId');
  if (!episode) return res.status(404).json({ success: false, message: 'Episode not found.' });

  const isOwner = episode.seriesId.creatorId.toString() === req.user._id.toString();
  if (!isOwner && req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Not authorized.' });
  }

  const updates = { ...req.body };
  if (req.file) {
    const result = await uploadToCloudinary(req.file.buffer, {
      folder: 'celova/episode-thumbnails', width: 640, height: 360, crop: 'fill',
    });
    updates.thumbnail = result.secure_url;
    updates.thumbnailPublicId = result.public_id;
  }

  const updated = await Episode.findByIdAndUpdate(req.params.id, updates, { new: true });
  res.json({ success: true, message: 'Episode updated.', episode: updated });
});

// DELETE /api/episodes/:id
exports.deleteEpisode = asyncHandler(async (req, res) => {
  const episode = await Episode.findById(req.params.id).populate('seriesId');
  if (!episode) return res.status(404).json({ success: false, message: 'Episode not found.' });

  const isOwner = episode.seriesId.creatorId.toString() === req.user._id.toString();
  if (!isOwner && req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Not authorized.' });
  }

  await Series.findByIdAndUpdate(episode.seriesId._id, { $inc: { totalEpisodes: -1 } });
  await episode.deleteOne();

  res.json({ success: true, message: 'Episode deleted.' });
});

// POST /api/episodes/:id/view
exports.incrementView = asyncHandler(async (req, res) => {
  await Episode.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } });
  await Series.findOneAndUpdate(
    { _id: req.body.seriesId },
    { $inc: { totalViews: 1, weeklyViews: 1 } }
  );
  res.json({ success: true });
});
