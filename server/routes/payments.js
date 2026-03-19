const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');

router.get('/plans', paymentController.getPlans);
router.post('/checkout', protect, paymentController.createCheckout);
// Stripe webhook needs raw body — handled separately
router.post('/webhook', express.raw({ type: 'application/json' }), paymentController.stripeWebhook);
router.get('/subscription', protect, paymentController.getSubscription);

module.exports = router;
