const Comment = require('../models/Comment');
const { asyncHandler } = require('../middleware/errorHandler');

// GET /api/comments/episode/:episodeId
exports.getComments = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [comments, total] = await Promise.all([
    Comment.find({ episodeId: req.params.episodeId, parentId: null, isDeleted: false })
      .populate('userId', 'name avatar role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    Comment.countDocuments({ episodeId: req.params.episodeId, parentId: null, isDeleted: false }),
  ]);

  // Attach top-level replies
  const commentIds = comments.map((c) => c._id);
  const replies = await Comment.find({ parentId: { $in: commentIds }, isDeleted: false })
    .populate('userId', 'name avatar role')
    .sort({ createdAt: 1 });

  const commentsWithReplies = comments.map((comment) => ({
    ...comment.toJSON(),
    replies: replies.filter((r) => r.parentId.toString() === comment._id.toString()),
  }));

  res.json({ success: true, comments: commentsWithReplies, total, page: parseInt(page) });
});

// POST /api/comments
exports.postComment = asyncHandler(async (req, res) => {
  const { episodeId, text, parentId } = req.body;
  const comment = await Comment.create({
    episodeId, text, parentId: parentId || null, userId: req.user._id,
  });
  await comment.populate('userId', 'name avatar role');
  res.status(201).json({ success: true, comment });
});

// PUT /api/comments/:id
exports.editComment = asyncHandler(async (req, res) => {
  const comment = await Comment.findById(req.params.id);
  if (!comment) return res.status(404).json({ success: false, message: 'Comment not found.' });
  if (comment.userId.toString() !== req.user._id.toString()) {
    return res.status(403).json({ success: false, message: 'Not authorized.' });
  }
  comment.text = req.body.text;
  comment.isEdited = true;
  await comment.save();
  res.json({ success: true, comment });
});

// DELETE /api/comments/:id
exports.deleteComment = asyncHandler(async (req, res) => {
  const comment = await Comment.findById(req.params.id);
  if (!comment) return res.status(404).json({ success: false, message: 'Comment not found.' });

  const isOwner = comment.userId.toString() === req.user._id.toString();
  if (!isOwner && req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Not authorized.' });
  }

  comment.isDeleted = true;
  comment.text = '[deleted]';
  await comment.save();
  res.json({ success: true, message: 'Comment deleted.' });
});

// POST /api/comments/:id/like
exports.likeComment = asyncHandler(async (req, res) => {
  const comment = await Comment.findById(req.params.id);
  if (!comment) return res.status(404).json({ success: false, message: 'Comment not found.' });

  const alreadyLiked = comment.likes.includes(req.user._id);
  if (alreadyLiked) {
    comment.likes.pull(req.user._id);
  } else {
    comment.likes.push(req.user._id);
  }
  await comment.save();
  res.json({ success: true, liked: !alreadyLiked, likeCount: comment.likes.length });
});
