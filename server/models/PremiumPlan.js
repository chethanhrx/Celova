const mongoose = require('mongoose');

const premiumPlanSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: 'INR',
    },
    features: [{ type: String }],
    durationDays: {
      type: Number,
      required: true,
    },
    stripeProductId: {
      type: String,
      default: '',
    },
    stripePriceId: {
      type: String,
      default: '',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    sortOrder: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('PremiumPlan', premiumPlanSchema);
