const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const { uploadImage } = require('../middleware/upload');

router.get('/profile/:id', userController.getPublicProfile);

router.put('/profile', protect, uploadImage.single('avatar'), userController.updateProfile);
router.post('/follow/:id', protect, userController.followUser);
router.delete('/follow/:id', protect, userController.unfollowUser);

router.get('/my-list', protect, userController.getMyList);
router.post('/my-list/:seriesId', protect, userController.addToMyList);
router.delete('/my-list/:seriesId', protect, userController.removeFromMyList);

router.put('/watch-progress', protect, userController.updateWatchProgress);
router.get('/watch-history', protect, userController.getWatchHistory);
router.put('/upgrade-premium', protect, userController.upgradePremium);

router.get('/notifications', protect, userController.getNotifications);
router.put('/notifications/read-all', protect, userController.markAllNotificationsRead);

module.exports = router;
