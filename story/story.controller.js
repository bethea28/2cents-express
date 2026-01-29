const bucket = require("../firebase.config");
const StoryService = require("./story.service");
const User = require("../user/user.model");
const Story = require("./story.model");
const { addHours } = require("date-fns"); // Required for the 24h deadline

// 🛡️ NEW IMPORTS FOR FFMPEG
const ffmpeg = require('fluent-ffmpeg');
const os = require('os');
const path = require('path');
const fs = require('fs');

const uploadToFirebase = (file) => {
  return new Promise(async (resolve, reject) => {
    const timestamp = Date.now();
    const tempInputPath = path.join(os.tmpdir(), `raw_${timestamp}`);
    const tempVideoPath = path.join(os.tmpdir(), `opt_${timestamp}.mp4`);
    const thumbFileName = `thumb_${timestamp}.jpg`; // 🛡️ Keep this consistent
    const tempThumbPath = path.join(os.tmpdir(), thumbFileName);

    try {
      fs.writeFileSync(tempInputPath, file.buffer);

      // 1. Parallel Processing
      await Promise.all([
        // Task A: Video Fast-Start
        new Promise((res, rej) => {
          ffmpeg(tempInputPath)
            .outputOptions(['-movflags +faststart', '-codec copy'])
            .on('end', res)
            .on('error', rej)
            .save(tempVideoPath);
        }),
        // Task B: Precise Thumbnail Capture
        new Promise((res, rej) => {
          ffmpeg(tempInputPath)
            .screenshots({
              timestamps: [1],
              filename: thumbFileName,
              folder: os.tmpdir(),
              size: '720x?'
            })
            .on('end', res)
            .on('error', rej);
        })
      ]);

      // 2. Parallel Uploads
      const videoName = `videos/${timestamp}_${file.originalname}`;
      const thumbName = `thumbnails/${timestamp}_thumb.jpg`;

      // await Promise.all([
      //   bucket.upload(tempVideoPath, { destination: videoName }),
      //   bucket.upload(tempThumbPath, { destination: thumbName })
      // ]);


      await Promise.all([
        bucket.upload(tempVideoPath, {
          destination: videoName,
          metadata: { contentType: 'video/mp4' } // 🛡️ Force streamable
        }),
        bucket.upload(tempThumbPath, {
          destination: thumbName,
          metadata: { contentType: 'image/jpeg' } // 🛡️ Force viewable
        })
      ]);
      const videoUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(videoName)}?alt=media`;
      const thumbnailUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(thumbName)}?alt=media`;

      resolve({ videoUrl, thumbnailUrl });

    } catch (error) {
      console.error("Refinery Error:", error);
      reject(error);
    } finally {
      // 3. Cleanup
      [tempInputPath, tempVideoPath, tempThumbPath].forEach(p => {
        if (fs.existsSync(p)) {
          try { fs.unlinkSync(p); } catch (e) { }
        }
      });
    }
  });
};
const storyController = {
  // --- STAGE 1: THE CALL-OUT (Create Story) ---

  async createStory(req, res) {

    try {
      const { title, wager, sideAContent, opponentHandle } = req.body;
      const userId = req.user.id;

      console.log('creating story', req.body)
      // Ensure a video was actually uploaded
      if (!req.file) {
        return res.status(400).json({ error: "A video rant is required to start a beef." });
      }

      // Using local path for Multer (ensure 'uploads' is static in server.js)
      console.log('☁️ Uploading to Firebase...');
      // const sideAVideoUrl = await uploadToFirebase(req.file);
      const { videoUrl, thumbnailUrl } = await uploadToFirebase(req.file);
      // Save these to your MongoDB/PostgreSQL Story record
      console.log('🔗 Firebase URL generated:', videoUrl);
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
        sideAVideoUrl: videoUrl,
        sideAThumbnailUrl: thumbnailUrl,
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
  // --- STAGE 3: THE REBUTTAL (User B Uploads) ---
  async submitRebuttal(req, res) {
    try {
      const { id } = req.params;
      const file = req.file;
      const sideBAuthorId = req.user.id;

      if (!file) return res.status(400).json({ error: "Rebuttal video required." });

      // 🛡️ STAFF MOVE: Generate both URLs for the opponent
      const { videoUrl, thumbnailUrl } = await uploadToFirebase(file);

      const activeStory = await StoryService.activateArena(id, sideBAuthorId, {
        sideBVideoUrl: videoUrl,
        sideBThumbnailUrl: thumbnailUrl, // 🛡️ CRITICAL: Add this line!
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
      const { userId } = req.params;
      const updateData = req.body;
      console.log('GANGUM STYLE', userId)
      const updatedStory = await StoryService.updateStory(userId, updateData);
      return res.status(200).json(updatedStory);
    } catch (error) {
      return res.status(error.message === 'Story not found' ? 404 : 500).json({ error: error.message });
    }
  },

  async getAllPendingStories(req, res) {
    try {
      const { userId } = req.params;
      console.log('all pending stories', userId)
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
    // 🛡️ If the frontend sends /completed?userId=123, we use it.
    // 🛡️ If they just send /completed, userId is undefined (Global Feed).
    const { userId } = req.query;

    const stories = await StoryService.getAllCompleteStories(userId);
    return res.json(stories);
  },

};

module.exports = storyController;