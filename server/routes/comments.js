const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentController');
const { protect } = require('../middleware/auth');

router.get('/episode/:episodeId', commentController.getComments);
router.post('/', protect, commentController.postComment);
router.put('/:id', protect, commentController.editComment);
router.delete('/:id', protect, commentController.deleteComment);
router.post('/:id/like', protect, commentController.likeComment);

module.exports = router;
