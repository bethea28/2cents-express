const bucket = require("../firebase.config");
const StoryService = require("./story.service");

// Firebase Helper
const uploadToFirebase = (file) => {
  return new Promise((resolve, reject) => {
    const fileName = `videos/${Date.now()}_${file.originalname}`;
    const fileUpload = bucket.file(fileName);
    const blobStream = fileUpload.createWriteStream({ metadata: { contentType: file.mimetype } });
    blobStream.on("error", (error) => reject(error));
    blobStream.on("finish", () => {
      const url = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(fileName)}?alt=media`;
      resolve(url);
    });
    blobStream.end(file.buffer);
  });
};

const storyController = {
  // --- SIDE A: INITIAL CALL-OUT ---
  async createStory(req, res) {
    try {
      const sideAAuthorId = req.user.id;
      const file = req.file;
      if (!file) return res.status(400).json({ error: "Video required." });

      const publicUrl = await uploadToFirebase(file);
      const storyData = { ...req.body, sideAVideoUrl: publicUrl };

      const newStory = await StoryService.createStory(storyData, sideAAuthorId);
      return res.status(201).json({ success: true, data: newStory });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  },

  // --- STAGE 2: THE HANDSHAKE (User B Accepts the Terms) ---
  async acceptStory(req, res) {
    try {
      const { id } = req.params; // The Story ID
      const userId = req.user.id; // The logged-in User B

      // 1. Call the service to update status and RESET the 24h clock
      const updatedStory = await StoryService.acceptChallenge(id, userId);

      // 2. Return the updated story so the frontend can update the UI
      return res.status(200).json({
        success: true,
        message: "Challenge accepted! You have 24 hours to record your rebuttal.",
        data: updatedStory
      });
    } catch (error) {
      console.error("Accept Story Error:", error);

      // Handle specific unauthorized or not found cases
      const statusCode = error.message.includes("Unauthorized") ? 403 : 404;
      return res.status(error.message ? statusCode : 500).json({
        error: error.message || "An error occurred while accepting the challenge."
      });
    }
  },

  // --- SIDE B: THE REBUTTAL (Starts the 72h Clock) ---
  async submitRebuttal(req, res) {
    try {
      const { id } = req.params;
      const file = req.file;
      const sideBAuthorId = req.user.id;

      if (!file) return res.status(400).json({ error: "Rebuttal video required." });

      const publicUrl = await uploadToFirebase(file);

      // We call activateArena to trigger the 72-hour voting logic
      const activeStory = await StoryService.activateArena(id, sideBAuthorId, {
        sideBVideoUrl: publicUrl,
        sideBAcknowledged: true
      });

      return res.status(200).json({ success: true, data: activeStory });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  },

  // --- RE-ADDED: updateStory (Fixes the Route Crash) ---
  async updateStory(req, res) {
    try {
      const { id } = req.params;
      // Use the generic service update for simple field changes
      const updatedStory = await StoryService.updateStory(id, req.body);
      return res.status(200).json(updatedStory);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  },

  async getAllPendingStories(req, res) {
    try {
      const { userId } = req.params;
      const stories = await StoryService.getAllPendingStories(userId);
      return res.status(200).json(stories);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  },
  async getStoryById(req, res) {
    try {
      const { id } = req.params;

      // 🛠 ENGINEER: Delegate to the service layer
      const story = await StoryService.getStoryById(id);

      if (!story) {
        return res.status(404).json({
          success: false,
          message: "Challenge not found"
        });
      }

      return res.status(200).json(story);
    } catch (error) {
      console.error("Error in getStoryById Controller:", error);
      return res.status(500).json({
        success: false,
        message: "Internal Server Error"
      });
    }
  },
  // storyController.js
  async updateStory(req, res) {
    try {
      const { userId } = req.params;
      const updateData = req.body;

      // This calls the service we fixed above
      console.log('first story id', req.params)
      const updatedStory = await StoryService.updateStory(userId, updateData);

      return res.status(200).json(updatedStory);
    } catch (error) {
      console.error("Update Story Error:", error);
      return res.status(error.message === 'Story not found' ? 404 : 500).json({
        message: error.message || "Internal Server Error"
      });
    }
  },
  async getAllCompleteStories(req, res) {
    try {
      const stories = await StoryService.getAllCompleteStories();
      return res.status(200).json(stories);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
};

module.exports = storyController;