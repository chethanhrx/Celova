const mongoose = require('mongoose');

const seriesSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      minlength: [2, 'Title must be at least 2 characters'],
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    creatorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    thumbnail: {
      type: String,
      required: [true, 'Thumbnail is required'],
    },
    thumbnailPublicId: {
      type: String, // Cloudinary public ID for deletion
      default: '',
    },
    genre: {
      type: String,
      enum: ['Action', 'Sci-Fi', 'Fantasy', 'Horror', 'Romance', 'Comedy', 'Mystery', 'Thriller'],
      required: [true, 'Genre is required'],
    },
    language: {
      type: String,
      enum: ['English', 'Hindi', 'Japanese', 'Korean', 'Spanish', 'French'],
      required: [true, 'Language is required'],
    },
    availableLanguages: [{
      type: String,
      enum: ['English', 'Hindi', 'Japanese', 'Korean', 'Spanish', 'French'],
    }],
    tags: [{ type: String, trim: true }],
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    totalRatings: {
      type: Number,
      default: 0,
    },
    totalViews: {
      type: Number,
      default: 0,
    },
    totalEpisodes: {
      type: Number,
      default: 0,
    },
    seasons: {
      type: Number,
      default: 1,
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
    ageRating: {
      type: String,
      enum: ['U', '7+', '13+', '16+', '18+'],
      default: 'U',
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    featuredOrder: {
      type: Number,
      default: 0,
    },
    year: {
      type: Number,
      default: () => new Date().getFullYear(),
    },
    trendingScore: {
      type: Number,
      default: 0,
    },
    weeklyViews: {
      type: Number,
      default: 0,
    },
    // Track when weekly views were last reset
    weeklyViewsResetAt: {
      type: Date,
      default: Date.now,
    },
    trailer: {
      type: String, // YouTube video ID
      default: '',
    },
    // Challenge association
    challengeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Challenge',
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Index for search and filtering
seriesSchema.index({ genre: 1, language: 1, status: 1 });
seriesSchema.index({ totalViews: -1 });
seriesSchema.index({ rating: -1 });
seriesSchema.index({ isFeatured: 1, featuredOrder: 1 });
seriesSchema.index({ creatorId: 1 });
seriesSchema.index({ createdAt: -1 });

// Calculate trending score: views * 0.6 + rating * 0.4
seriesSchema.methods.calculateTrendingScore = function () {
  return this.weeklyViews * 0.6 + this.rating * 0.4;
};

module.exports = mongoose.model('Series', seriesSchema);
