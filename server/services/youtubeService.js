const fs = require('fs');
const path = require('path');
const { getYouTubeClient } = require('../config/youtube');

/**
 * YouTube Service
 * Handles all interactions with YouTube Data API v3
 */

/**
 * Upload a video file to YouTube as UNLISTED
 * @param {string} filePath - Local path to the video file
 * @param {Object} metadata - Video metadata (title, description, tags)
 * @param {Function} onProgress - Progress callback (percentage)
 * @returns {Object} - { videoId, title, duration }
 */
const uploadVideoToYouTube = async (filePath, metadata, onProgress) => {
  const youtube = getYouTubeClient();
  const fileSize = fs.statSync(filePath).size;

  const requestBody = {
    snippet: {
      title: metadata.title || 'Untitled Episode',
      description: metadata.description || '',
      tags: metadata.tags || ['celova', 'animated series', 'ai animation'],
      categoryId: '24', // Entertainment
      defaultLanguage: 'en',
    },
    status: {
      privacyStatus: 'unlisted', // NEVER public
      selfDeclaredMadeForKids: false,
    },
  };

  const media = {
    mimeType: 'video/mp4',
    body: fs.createReadStream(filePath),
  };

  const response = await youtube.videos.insert(
    {
      part: ['snippet', 'status'],
      requestBody,
      media,
    },
    {
      onUploadProgress: (evt) => {
        const progress = Math.round((evt.bytesRead / fileSize) * 100);
        if (onProgress) onProgress(progress);
      },
    }
  );

  return {
    videoId: response.data.id,
    title: response.data.snippet.title,
    channelId: response.data.snippet.channelId,
  };
};

/**
 * Get details of a YouTube video by videoId
 * @param {string} videoId - YouTube video ID
 * @returns {Object|null}
 */
const getVideoDetails = async (videoId) => {
  try {
    const youtube = getYouTubeClient();
    const response = await youtube.videos.list({
      part: ['snippet', 'contentDetails', 'statistics', 'status'],
      id: [videoId],
    });

    if (!response.data.items || response.data.items.length === 0) {
      return null;
    }

    const video = response.data.items[0];
    const duration = parseISO8601Duration(video.contentDetails.duration);

    return {
      videoId: video.id,
      title: video.snippet.title,
      description: video.snippet.description,
      thumbnail: video.snippet.thumbnails.maxres?.url || video.snippet.thumbnails.high?.url,
      duration, // in seconds
      privacyStatus: video.status.privacyStatus,
      viewCount: parseInt(video.statistics.viewCount || 0),
      publishedAt: video.snippet.publishedAt,
    };
  } catch (error) {
    console.error('YouTube getVideoDetails error:', error.message);
    return null;
  }
};

/**
 * Delete a video from YouTube
 * @param {string} videoId
 */
const deleteYouTubeVideo = async (videoId) => {
  try {
    const youtube = getYouTubeClient();
    await youtube.videos.delete({ id: videoId });
    return true;
  } catch (error) {
    console.error('YouTube delete error:', error.message);
    return false;
  }
};

/**
 * Parse ISO 8601 duration string (PT1H23M45S) to seconds
 * @param {string} duration
 * @returns {number} seconds
 */
const parseISO8601Duration = (duration) => {
  if (!duration) return 0;
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  const hours = parseInt(match[1] || 0);
  const minutes = parseInt(match[2] || 0);
  const seconds = parseInt(match[3] || 0);
  return hours * 3600 + minutes * 60 + seconds;
};

/**
 * Clean up temp file from disk
 * @param {string} filePath
 */
const cleanupTempFile = (filePath) => {
  try {
    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (err) {
    console.error('Failed to clean up temp file:', err.message);
  }
};

module.exports = {
  uploadVideoToYouTube,
  getVideoDetails,
  deleteYouTubeVideo,
  cleanupTempFile,
  parseISO8601Duration,
};
