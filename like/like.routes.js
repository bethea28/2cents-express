const express = require("express");
const router = express.Router();
const likeController = require("./like.controller"); // 🛠 Swapped to likeController
const authenticateToken = require("../middleware/authMiddleware");

// 🛠 ENGINEER: Removed multer/upload because likes don't send files.
// This keeps the request-response cycle much faster.

/**
 * @route   POST /api/comments/:id/like
 * @desc    Toggle a like on a specific comment
 * @access  Private
 */
router.post(
  '/like/:id', // Using :id to represent the commentId
  authenticateToken,
  likeController.toggleLike
);

module.exports = router;