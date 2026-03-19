const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const watchHistorySchema = new mongoose.Schema({
  seriesId: { type: mongoose.Schema.Types.ObjectId, ref: 'Series' },
  episodeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Episode' },
  progress: { type: Number, default: 0 }, // seconds watched
  watchedAt: { type: Date, default: Date.now },
});

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false, // Don't return password in queries
    },
    avatar: {
      type: String,
      default: '',
    },
    bio: {
      type: String,
      maxlength: [200, 'Bio cannot exceed 200 characters'],
      default: '',
    },
    role: {
      type: String,
      enum: ['viewer', 'creator', 'admin'],
      default: 'viewer',
    },
    isPremium: {
      type: Boolean,
      default: false,
    },
    premiumExpiry: {
      type: Date,
      default: null,
    },
    stripeCustomerId: {
      type: String,
      default: '',
    },
    stripeSubscriptionId: {
      type: String,
      default: '',
    },
    watchHistory: [watchHistorySchema],
    myList: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Series' }],
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    socialLinks: {
      youtube: { type: String, default: '' },
      twitter: { type: String, default: '' },
      instagram: { type: String, default: '' },
      website: { type: String, default: '' },
    },
    isVerifiedCreator: { type: Boolean, default: false },
    isBanned: { type: Boolean, default: false },
    banReason: { type: String, default: '' },
    notificationPrefs: {
      newEpisode: { type: Boolean, default: true },
      comments: { type: Boolean, default: true },
      ratings: { type: Boolean, default: true },
      payouts: { type: Boolean, default: true },
      badges: { type: Boolean, default: true },
    },
    bankAccount: {
      accountHolder: { type: String, default: '' },
      accountNumber: { type: String, default: '' },
      ifscCode: { type: String, default: '' },
      upiId: { type: String, default: '' },
    },
    badges: [{ type: String }],
    searchHistory: [{ query: String, searchedAt: { type: Date, default: Date.now } }],
    theme: { type: String, enum: ['dark', 'light'], default: 'dark' },
    // OTP for password reset
    resetOTP: { type: String },
    resetOTPExpiry: { type: Date },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual: follower count
userSchema.virtual('followerCount').get(function () {
  return this.followers ? this.followers.length : 0;
});

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Check if premium is expired on read
userSchema.post('find', function (docs) {
  docs.forEach((doc) => {
    if (doc.isPremium && doc.premiumExpiry && new Date() > doc.premiumExpiry) {
      doc.isPremium = false;
    }
  });
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Remove sensitive fields when converting to JSON
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.resetOTP;
  delete obj.resetOTPExpiry;
  delete obj.__v;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
