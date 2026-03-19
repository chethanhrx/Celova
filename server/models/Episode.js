const mongoose = require('mongoose');

const episodeSchema = new mongoose.Schema(
  {
    seriesId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Series',
      required: true,
    },
    seasonNumber: {
      type: Number,
      required: true,
      min: 1,
    },
    episodeNumber: {
      type: Number,
      required: true,
      min: 1,
    },
    title: {
      type: String,
      required: [true, 'Episode title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    description: {
      type: String,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
      default: '',
    },
    youtubeVideoId: {
      type: String,
      default: '',
    },
    thumbnail: {
      type: String,
      default: '',
    },
    thumbnailPublicId: {
      type: String,
      default: '',
    },
    duration: {
      type: Number, // seconds
      default: 0,
    },
    views: {
      type: Number,
      default: 0,
    },
    subtitleUrl: {
      type: String,
      default: '',
    },
    language: {
      type: String,
      enum: ['English', 'Hindi', 'Japanese', 'Korean', 'Spanish', 'French'],
      default: 'English',
    },
    status: {
      type: String,
      enum: ['live', 'draft', 'scheduled'],
      default: 'draft',
    },
    scheduledAt: {
      type: Date,
      default: null,
    },
    publishedAt: {
      type: Date,
      default: null,
    },
    // Chapter markers for video player (timestamps in seconds)
    chapters: [{
      title: String,
      startTime: Number,
    }],
    introEnd: {
      type: Number, // seconds — for Skip Intro button (default 90s)
      default: 90,
    },
    // Upload status tracking
    uploadStatus: {
      type: String,
      enum: ['pending', 'uploading', 'completed', 'failed'],
      default: 'pending',
    },
    uploadProgress: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Compound index to enforce uniqueness per series/season/episode
episodeSchema.index({ seriesId: 1, seasonNumber: 1, episodeNumber: 1 }, { unique: true });
episodeSchema.index({ seriesId: 1, status: 1 });
episodeSchema.index({ status: 1, scheduledAt: 1 });

// Virtual: formatted duration
episodeSchema.virtual('durationFormatted').get(function () {
  const mins = Math.floor(this.duration / 60);
  const secs = this.duration % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
});

module.exports = mongoose.model('Episode', episodeSchema);
