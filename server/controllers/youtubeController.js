const Episode = require('../models/Episode');
const { asyncHandler } = require('../middleware/errorHandler');
const { uploadVideoToYouTube, getVideoDetails, cleanupTempFile } = require('../services/youtubeService');
const { uploadVideo } = require('../middleware/upload');

// POST /api/youtube/upload
// Accepts video file via multipart, uploads to YouTube as unlisted, returns videoId
exports.uploadToYouTube = [
  uploadVideo.single('video'),
  asyncHandler(async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No video file provided.' });
    }

    const { title, description, tags, episodeId } = req.body;

    // Update episode upload status
    if (episodeId) {
      await Episode.findByIdAndUpdate(episodeId, { uploadStatus: 'uploading', uploadProgress: 0 });
    }

    try {
      const result = await uploadVideoToYouTube(
        req.file.path,
        { title: title || 'Untitled', description: description || '', tags: tags ? tags.split(',') : [] },
        async (progress) => {
          if (episodeId) {
            await Episode.findByIdAndUpdate(episodeId, { uploadProgress: progress });
          }
        }
      );

      // Update episode with YouTube video ID
      if (episodeId) {
        await Episode.findByIdAndUpdate(episodeId, {
          youtubeVideoId: result.videoId,
          uploadStatus: 'completed',
          uploadProgress: 100,
        });
      }

      // Clean up temp file
      cleanupTempFile(req.file.path);

      res.json({
        success: true,
        message: 'Video uploaded to YouTube successfully!',
        videoId: result.videoId,
        title: result.title,
      });
    } catch (error) {
      cleanupTempFile(req.file.path);
      if (episodeId) {
        await Episode.findByIdAndUpdate(episodeId, { uploadStatus: 'failed' });
      }
      throw error;
    }
  }),
];

// GET /api/youtube/video/:videoId
exports.getVideoInfo = asyncHandler(async (req, res) => {
  const details = await getVideoDetails(req.params.videoId);
  if (!details) {
    return res.status(404).json({ success: false, message: 'Video not found on YouTube.' });
  }
  res.json({ success: true, video: details });
});
