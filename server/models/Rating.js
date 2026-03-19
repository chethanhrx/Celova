const mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    seriesId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Series',
      default: null,
    },
    episodeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Episode',
      default: null,
    },
    stars: {
      type: Number,
      required: [true, 'Star rating is required'],
      min: [1, 'Minimum rating is 1'],
      max: [5, 'Maximum rating is 5'],
    },
    review: {
      type: String,
      maxlength: [500, 'Review cannot exceed 500 characters'],
      default: '',
    },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
);

// One rating per user per series/episode
ratingSchema.index({ userId: 1, seriesId: 1 }, { unique: true, sparse: true });
ratingSchema.index({ userId: 1, episodeId: 1 }, { unique: true, sparse: true });
ratingSchema.index({ seriesId: 1 });
ratingSchema.index({ episodeId: 1 });

module.exports = mongoose.model('Rating', ratingSchema);
