const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder');
const PremiumPlan = require('../models/PremiumPlan');
const User = require('../models/User');
const { asyncHandler } = require('../middleware/errorHandler');

// GET /api/payments/plans
exports.getPlans = asyncHandler(async (req, res) => {
  let plans = await PremiumPlan.find({ isActive: true }).sort({ sortOrder: 1 });

  // Seed default plans if none exist
  if (!plans.length) {
    plans = await PremiumPlan.insertMany([
      {
        name: 'Monthly',
        price: 149,
        currency: 'INR',
        durationDays: 30,
        sortOrder: 1,
        features: ['Ad-free streaming', 'HD quality', 'Download episodes', 'Watch Party host'],
      },
      {
        name: 'Quarterly',
        price: 399,
        currency: 'INR',
        durationDays: 90,
        sortOrder: 2,
        features: ['Everything in Monthly', 'Early access to new releases', 'Priority support'],
      },
      {
        name: 'Annual',
        price: 1199,
        currency: 'INR',
        durationDays: 365,
        sortOrder: 3,
        features: ['Everything in Quarterly', '2 months free', 'Exclusive creator badge', 'Behind-the-scenes access'],
      },
    ]);
  }

  res.json({ success: true, plans });
});

// POST /api/payments/checkout
exports.createCheckout = asyncHandler(async (req, res) => {
  const { planId } = req.body;
  const plan = await PremiumPlan.findById(planId);
  if (!plan) return res.status(404).json({ success: false, message: 'Plan not found.' });

  if (!plan.stripePriceId) {
    return res.status(400).json({
      success: false,
      message: 'Stripe not configured for this plan. Add STRIPE_SECRET_KEY to .env.',
    });
  }

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    customer_email: req.user.email,
    line_items: [{ price: plan.stripePriceId, quantity: 1 }],
    success_url: `${process.env.CLIENT_URL}/premium?success=true`,
    cancel_url: `${process.env.CLIENT_URL}/premium?cancelled=true`,
    metadata: { userId: req.user._id.toString(), planId: plan._id.toString() },
  });

  res.json({ success: true, sessionUrl: session.url });
});

// POST /api/payments/webhook — Stripe webhook
exports.stripeWebhook = asyncHandler(async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).json({ success: false, message: `Webhook Error: ${err.message}` });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const { userId, planId } = session.metadata;
    const plan = await PremiumPlan.findById(planId);

    if (plan && userId) {
      const expiry = new Date(Date.now() + plan.durationDays * 24 * 60 * 60 * 1000);
      await User.findByIdAndUpdate(userId, {
        isPremium: true,
        premiumExpiry: expiry,
        stripeSubscriptionId: session.subscription,
      });
    }
  }

  res.json({ received: true });
});

// GET /api/payments/subscription
exports.getSubscription = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('isPremium premiumExpiry stripeSubscriptionId');
  const isActive = user.isPremium && (!user.premiumExpiry || new Date() < new Date(user.premiumExpiry));
  res.json({ success: true, isPremium: isActive, premiumExpiry: user.premiumExpiry });
});
