const express = require('express');
const router = express.Router();
const episodeController = require('../controllers/episodeController');
const { protect, optionalAuth } = require('../middleware/auth');
const { roleCheck } = require('../middleware/roleCheck');
const { uploadImage } = require('../middleware/upload');

router.get('/series/:seriesId', optionalAuth, episodeController.getEpisodesBySeries);
router.get('/:id', optionalAuth, episodeController.getEpisodeById);
router.post('/:id/view', episodeController.incrementView);

router.post('/', protect, roleCheck('creator', 'admin'), uploadImage.single('thumbnail'), episodeController.createEpisode);
router.put('/:id', protect, roleCheck('creator', 'admin'), uploadImage.single('thumbnail'), episodeController.updateEpisode);
router.delete('/:id', protect, roleCheck('creator', 'admin'), episodeController.deleteEpisode);

module.exports = router;
