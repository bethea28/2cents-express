const express = require("express");
const router = express.Router();
const commentController = require("./comment.controller");
const authenticateToken = require("../middleware/authMiddleware");

// POST /api/comments/123 -> Create a comment on Story 123
router.post(
  '/:storyId',
  authenticateToken,
  commentController.createComment
);

// GET /api/comments/123 -> Fetch comments for Story 123
router.get(
  '/:storyId',
  commentController.getComments
);

module.exports = router;