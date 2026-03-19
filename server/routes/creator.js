const express = require('express');
const router = express.Router();
const creatorController = require('../controllers/creatorController');
const { protect } = require('../middleware/auth');
const { roleCheck } = require('../middleware/roleCheck');

router.use(protect, roleCheck('creator', 'admin'));

router.get('/dashboard', creatorController.getDashboard);
router.get('/analytics', creatorController.getAnalytics);
router.get('/earnings', creatorController.getEarnings);
router.post('/earnings/withdraw', creatorController.requestWithdrawal);
router.get('/followers', creatorController.getFollowers);

module.exports = router;
