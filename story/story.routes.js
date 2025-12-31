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
// router.post('/createStory', authenticateToken, upload.single('sideAVideo'), storyController.createStory);
// 1. Create the Beef (Side A)
router.post(
  '/createStory',
  authenticateToken,
  upload.single('video'), // Frontend sends 'video'
  storyController.createStory
);
router.post(
  '/storiesVote/:id',
  authenticateToken,
  upload.single('video'), // Frontend sends 'video'
  storyController.createStory
);

// 2. Respond to the Beef (Side B)
router.patch(
  '/rebuttal/:id',
  authenticateToken,
  upload.single('video'), // Frontend also sends 'video' here
  storyController.submitRebuttal
);
// story.routes.js

// STAGE 2: The Handshake
// This route moves a story from 'pending-acceptance' to 'pending-rebuttal'
router.patch(
  '/acceptChallenge/:id',
  authenticateToken,
  storyController.acceptStory // Hits your new controller method
);
// Add this for Rebuttals
router.patch(
  '/updateSideBVideo/:id',
  authenticateToken,
  upload.single('sideBVideo'), // <--- Tells Multer to catch the Rebuttal file
  storyController.updateStory // Or whatever your update function is named
);
router.get(
  "/:userId/getAllPendingStories",
  authenticateToken,
  storyController.getAllPendingStories
);
router.get(
  "/getStoryById/:id",
  authenticateToken,
  storyController.getStoryById
);
// GLOBAL FEED (Public)
router.get(
  "/getAllCompleteStories",
  authenticateToken,
  storyController.getAllCompleteStories
);
router.patch(
  "/:userId",
  authenticateToken,
  storyController.updateStory
);
// router.get("/getAllPendingStories", authenticateToken, storyController.getAllPendingStories);
// router.post("/createStory", storyController.createStory);
// router.post("/createStory", authenticateToken, storyController.createStory);
// router.get("/getAllStories", authenticateToken, storyController.getAllStories);
module.exports = router;
