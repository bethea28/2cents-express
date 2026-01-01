const express = require("express");
const router = express.Router();
const voteController = require("./vote.controller");
const authenticateToken = require("../middleware/authMiddleware");
const multer = require('multer');
const storage = multer.memoryStorage(); // IMPORTANT: Use memory, not disk
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024 // Limits uploads to 50MB
  }
});
// router.post('/createStory', authenticateToken, upload.single('sideAVideo'), storyController.createStory);
// 1. Create the Beef (Side A)

router.post(
  '/storiesVote/:id',
  authenticateToken,
  upload.single('video'), // Frontend sends 'video'
  voteController.castVote
);

module.exports = router;
