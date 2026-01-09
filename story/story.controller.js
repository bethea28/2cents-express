const bucket = require("../firebase.config");
const StoryService = require("./story.service");
const User = require("../user/user.model");
const Story = require("./story.model");
const { addHours } = require("date-fns"); // Required for the 24h deadline

// --- Firebase Helper ---
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
  // --- STAGE 1: THE CALL-OUT (Create Story) ---
  async createStory(req, res) {
    try {
      const { title, wager, sideAContent, opponentHandle } = req.body;
      const userId = req.user.id;


      // Ensure a video was actually uploaded
      if (!req.file) {
        return res.status(400).json({ error: "A video rant is required to start a beef." });
      }

      // Using local path for Multer (ensure 'uploads' is static in server.js)
      console.log('☁️ Uploading to Firebase...');
      const sideAVideoUrl = await uploadToFirebase(req.file);
      console.log('🔗 Firebase URL generated:', sideAVideoUrl);
      console.log('🛡️ Creating Story for User ID:', userId);

      const challenger = await User.findByPk(userId);
      if (!challenger) return res.status(404).json({ error: "Challenger not found." });

      const cleanHandle = (opponentHandle || "").replace('@', '').trim();
      const opponent = await User.findOne({ where: { username: cleanHandle } });

      if (!opponent) {
        return res.status(404).json({ error: `User "@${cleanHandle}" does not exist.` });
      }

      const acceptanceDeadline = addHours(new Date(), 24);
      const finalTitle = title || `Beef over ${wager || 'nothing'}`;
      const slug = `${finalTitle.toLowerCase().trim().replace(/[^a-z0-9 ]/g, '').replace(/\s+/g, "-")}-${Date.now()}`;

      const newStory = await Story.create({
        title: finalTitle,
        slug,
        wager,
        sideAContent,
        sideAVideoUrl,
        sideAAuthorId: userId,
        sideAUsername: challenger.username,
        sideBAuthorId: opponent.id,
        sideBUsername: opponent.username,
        status: "pending-acceptance",
        expiresAt: acceptanceDeadline,
      });

      return res.status(201).json(newStory);

    } catch (error) {
      console.error("🔥 Create Story Error:", error);
      return res.status(500).json({ error: error.message });
    }
  },

  // --- STAGE 2: THE HANDSHAKE (User B Accepts) ---
  async acceptStory(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const updatedStory = await StoryService.acceptChallenge(id, userId);

      return res.status(200).json({
        success: true,
        message: "Challenge accepted! 24h clock started.",
        data: updatedStory
      });
    } catch (error) {
      const statusCode = error.message.includes("Unauthorized") ? 403 : 404;
      return res.status(error.message ? statusCode : 500).json({ error: error.message });
    }
  },

  // --- STAGE 3: THE REBUTTAL (User B Uploads) ---
  async submitRebuttal(req, res) {
    try {
      const { id } = req.params;
      const file = req.file;
      const sideBAuthorId = req.user.id;

      if (!file) return res.status(400).json({ error: "Rebuttal video required." });

      // Uploading to Firebase for the final public "Arena" stage
      const publicUrl = await uploadToFirebase(file);

      const activeStory = await StoryService.activateArena(id, sideBAuthorId, {
        sideBVideoUrl: publicUrl,
        sideBAcknowledged: true
      });

      return res.status(200).json({ success: true, data: activeStory });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  },

  // --- GETTERS & UPDATERS ---
  async updateStory(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      const updatedStory = await StoryService.updateStory(id, updateData);
      return res.status(200).json(updatedStory);
    } catch (error) {
      return res.status(error.message === 'Story not found' ? 404 : 500).json({ error: error.message });
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
      const story = await StoryService.getStoryById(id);
      if (!story) return res.status(404).json({ success: false, message: "Not found" });
      return res.status(200).json(story);
    } catch (error) {
      return res.status(500).json({ error: error.message });
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