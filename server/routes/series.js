const express = require('express');
const router = express.Router();
const seriesController = require('../controllers/seriesController');
const { protect, optionalAuth } = require('../middleware/auth');
const { roleCheck } = require('../middleware/roleCheck');
const { uploadImage } = require('../middleware/upload');

router.get('/', optionalAuth, seriesController.getSeries);
router.get('/featured', seriesController.getFeatured);
router.get('/top10', seriesController.getTop10);
router.get('/trending', seriesController.getTrending);
router.get('/creator/:creatorId', optionalAuth, seriesController.getSeriesByCreator);
router.get('/:id', optionalAuth, seriesController.getSeriesById);

router.post('/', protect, roleCheck('creator', 'admin'), uploadImage.single('thumbnail'), seriesController.createSeries);
router.put('/:id', protect, roleCheck('creator', 'admin'), uploadImage.single('thumbnail'), seriesController.updateSeries);
router.delete('/:id', protect, roleCheck('creator', 'admin'), seriesController.deleteSeries);

module.exports = router;
