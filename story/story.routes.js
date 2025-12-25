const express = require("express");
const router = express.Router();
const storyController = require("./story.controller");
const authenticateToken = require("../middleware/authMiddleware");
const multer = require('multer');
const storage = multer.memoryStorage(); // IMPORTANT: Use memory, not disk
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024 // Limits uploads to 50MB
  }
});
router.post('/createStory', authenticateToken, upload.single('sideAVideo'), storyController.createStory);
// router.post("/createStory", storyController.createStory);
// router.post("/createStory", authenticateToken, storyController.createStory);
// router.get("/getAllStories", authenticateToken, storyController.getAllStories);
// router.get(
//   "/:userId/getAllPendingStories",
//   authenticateToken,
//   storyController.getAllPendingStories
// );
module.exports = router;
