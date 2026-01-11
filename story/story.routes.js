"use strict";

const express = require("express");
const router = express.Router();
const storyController = require("./story.controller");
// 🛡️ STAFF FIX: Destructure to get the function, not the object
// const { authMiddleware } = require("../middleware/authMiddleware");
const multer = require('multer');
const { authMiddleware } = require("../middleware/authMiddleware");
// ✅ SUCCESS: This "destructures" the object to grab just the function.
/**
 * 🛠️ MULTER CONFIGURATION
 * Using memory storage for buffer-based processing.
 */
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit
  }
});

// --- 🥊 STORY CREATION & RESPONSES ---

// 1. Create the Beef (Side A)
router.post(
  '/createStory',
  authMiddleware,
  upload.single('video'),
  storyController.createStory
);

// 2. Respond to the Beef (Side B)
router.patch(
  '/rebuttal/:id',
  authMiddleware,
  upload.single('video'),
  storyController.submitRebuttal
);

// 3. Accept the Challenge
// Moves story from 'pending-acceptance' to 'pending-rebuttal'
router.patch(
  '/acceptChallenge/:id',
  authMiddleware,
  storyController.acceptStory
);

// --- 🗳️ VOTING ---

// router.post(
//   '/storiesVote/:id',
//   authMiddleware,
//   storyController.castVote // 🛡️ FIXED: Was incorrectly calling createStory before
// );

// --- 🔍 QUERIES (Fetching Stories) ---

// Get specific pending stories for a user
router.get(
  "/:userId/getAllPendingStories",
  authMiddleware,
  storyController.getAllPendingStories
);

// Public Global Feed (Completed stories)
router.get(
  "/getAllCompleteStories",
  authMiddleware,
  storyController.getAllCompleteStories
);

// Get a single story by ID
router.get(
  "/getStoryById/:id",
  authMiddleware,
  storyController.getStoryById
);

// --- ⚙️ UPDATES ---

router.patch(
  "/:userId",
  authMiddleware,
  storyController.updateStory
);

module.exports = router;