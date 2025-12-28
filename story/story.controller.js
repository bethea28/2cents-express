const bucket = require("../firebase.config"); // Import your Firebase bucket
const StoryService = require("./story.service");
// Helper for Firebase (Define this at the top of your controller file)
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
  // --- THE REBUTTAL CONTROLLER ---
  async submitRebuttal(req, res) {
    console.log('handele rebuttal server')
    try {
      const { id } = req.params; // The Story ID
      const file = req.file;

      if (!file) return res.status(400).json({ error: "Rebuttal video is required." });

      // 1. Upload to Firebase using our helper
      const publicUrl = await uploadToFirebase(file);

      // 2. Update the Story via Service
      const updatedStory = await StoryService.completeStory(id, {
        sideBVideoUrl: publicUrl,
        sideBAcknowledged: true
      });

      return res.status(200).json(updatedStory);
    } catch (error) {
      console.error("Rebuttal Error:", error);
      return res.status(500).json({ error: error.message });
    }
  },
  // --- THE CREATE STORY CONTROLLER (SIDE A) ---
  async createStory(req, res) {
    try {
      const file = req.file;
      const { title, opponentHandle, stake, storyType } = req.body;

      if (!file) return res.status(400).json({ error: "Video file is required." });

      // USE THE HELPER
      const publicUrl = await uploadToFirebase(file, "challenges");

      const storyData = {
        title,
        opponentHandle,
        wager: stake,
        storyType,
        sideAVideoUrl: publicUrl,
      };

      const newStory = await StoryService.createStory(storyData, req.user.id);
      return res.status(201).json(newStory);

    } catch (error) {
      return res.status(500).json({ error: error.message || error });
    }
  },

  // In story.controller.js
  async getAllPendingStories(req, res) {
    try {
      // Correct way: Pull from the URL params defined in the route
      const { userId } = req.params;

      console.log("Fetching stories for User ID:", userId);

      const stories = await StoryService.getAllPendingStories(userId);
      return res.status(200).json(stories);
    } catch (error) {
      console.error("Controller Error:", error);
      return res.status(500).json({ error: error.message });
    }
  },
  async getAllCompleteStories(req, res) {
    try {
      // No userId needed here because it's public
      const stories = await StoryService.getAllCompleteStories();
      return res.status(200).json(stories);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  },
  async updateStory(req, res) {
    try {
      const { userId: id } = req.params; // From the URL
      const updateData = req.body; // { sideBAcknowledged: true }

      const updatedStory = await StoryService.updateStory(id, updateData);

      return res.status(200).json(updatedStory);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
};

module.exports = storyController;

// const storyController = {
//   async createStory(req, res) {
//     try {
//       const storyData = req.body;
//       const sideAAuthorId = req.user.id; // Assuming your JWT middleware populates req.user

//       console.log("req body now nick just req", req);
//       console.log("ALL STORY DATA NOW ", storyData);
//       // return;
//       const newStory = await StoryService.createStory(storyData, sideAAuthorId);

//       return res.status(201).json({
//         message: `Story created successfully (${newStory.storyType}).`,
//         story: newStory,
//       });
//     } catch (error) {
//       console.error("Error creating story:", error);
//       let statusCode = 500;
//       if (
//         error.message.includes("required") ||
//         error.message.includes("Invalid")
//       ) {
//         statusCode = 400;
//       } else if (error.message.includes("already exists")) {
//         statusCode = 409;
//       }
//       return res.status(statusCode).json({ error: error.message });
//     }
//   },
//   async getAllStories(req, res) {
//     try {
//       // const storyData = req.body;
//       // const sideAAuthorId = req.user.id; // Assuming your JWT middleware populates req.user

//       console.log("req body now nick");
//       // console.log("USER ID NOW nicky ", storyData);
//       const newStory = await StoryService.getAllStories();

//       return res.status(201).json({
//         message: `Got all stories`,
//         allStories: newStory,
//       });
//     } catch (error) {
//       console.error("Error creating story:", error);
//       let statusCode = 500;
//       if (
//         error.message.includes("required") ||
//         error.message.includes("Invalid")
//       ) {
//         statusCode = 400;
//       } else if (error.message.includes("already exists")) {
//         statusCode = 409;
//       }
//       return res.status(statusCode).json({ error: error.message });
//     }
//   },
//   async getAllPendingStories(req, res) {
//     try {
//       // return;
//       // const storyData = req.body;
//       // const sideAAuthorId = req.user.id; // Assuming your JWT middleware populates req.user
//       const userId = req.params;
//       console.log("step one again", userId);
//       // console.log("USER ID NOW nicky ", storyData);
//       const newStory = await StoryService.getAllPendingStories(req, res);
//       console.log("PENDING STORIES NOW", newStory);
//       return res.status(201).json({
//         message: `Got all Pending stories`,
//         allPendingStories: newStory,
//       });
//     } catch (error) {
//       console.error("Error creating story:", error);
//       let statusCode = 500;
//       if (
//         error.message.includes("required") ||
//         error.message.includes("Invalid")
//       ) {
//         statusCode = 400;
//       } else if (error.message.includes("already exists")) {
//         statusCode = 409;
//       }
//       return res.status(statusCode).json({ error: error.message });
//     }
//   },
// };

// module.exports = storyController;
