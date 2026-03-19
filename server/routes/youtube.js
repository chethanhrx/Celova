const express = require('express');
const router = express.Router();
const youtubeController = require('../controllers/youtubeController');
const { protect } = require('../middleware/auth');
const { roleCheck } = require('../middleware/roleCheck');

router.post('/upload', protect, roleCheck('creator', 'admin'), youtubeController.uploadToYouTube);
router.get('/video/:videoId', protect, youtubeController.getVideoInfo);

module.exports = router;
