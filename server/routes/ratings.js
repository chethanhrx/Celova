const express = require('express');
const router = express.Router();
const ratingController = require('../controllers/ratingController');
const { protect } = require('../middleware/auth');

router.post('/', protect, ratingController.upsertRating);
router.get('/series/:seriesId', ratingController.getSeriesRatings);
router.get('/episode/:episodeId', ratingController.getEpisodeRatings);

module.exports = router;
