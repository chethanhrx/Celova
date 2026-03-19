const mongoose = require('mongoose');

const earningSchema = new mongoose.Schema(
  {
    creatorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    month: {
      type: Number,
      required: true,
      min: 1,
      max: 12,
    },
    year: {
      type: Number,
      required: true,
    },
    adRevenue: {
      type: Number,
      default: 0,
    },
    premiumRevenue: {
      type: Number,
      default: 0,
    },
    bonusRevenue: {
      type: Number,
      default: 0,
    },
    totalRevenue: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['pending', 'paid'],
      default: 'pending',
    },
    paidAt: {
      type: Date,
      default: null,
    },
    transactionId: {
      type: String,
      default: '',
    },
    currency: {
      type: String,
      default: 'INR',
    },
  },
  {
    timestamps: true,
  }
);

// One earning record per creator per month/year
earningSchema.index({ creatorId: 1, month: 1, year: 1 }, { unique: true });

module.exports = mongoose.model('Earning', earningSchema);
