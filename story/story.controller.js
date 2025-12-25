const bucket = require("../firebase.config"); // Import your Firebase bucket
const StoryService = require("./story.service");

const storyController = {
  async createStory(req, res) {
    try {
      const file = req.file;
      if (!file) {
        return res.status(400).json({ error: "Video file is required." });
      }

      // 1. Prepare the file for Firebase
      const fileName = `videos/${Date.now()}_${file.originalname}`;
      const fileUpload = bucket.file(fileName);

      // 2. Create a "Write Stream" to push the video to the cloud
      const blobStream = fileUpload.createWriteStream({
        metadata: { contentType: file.mimetype },
      });

      // blobStream.on("error", (error) => {
      //   throw new Error("Firebase Upload Error: " + error.message);
      // });
      blobStream.on("error", (error) => {
        console.error("Firebase Upload Error:", error);
        // You must send a response here, or the app will just spin forever
        return res.status(500).json({ error: "Failed to upload video to cloud storage." });
      });
      blobStream.on("finish", async () => {
        // 3. Construct the permanent public URL
        const publicUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(fileName)}?alt=media`;

        // 4. Pass the CLOUD URL to your StoryService
        const storyData = {
          ...req.body,
          sideAVideoUrl: publicUrl,
        };

        const sideAAuthorId = req.user.id;
        console.log("🚀 Creating Call Out with Cloud Video:", sideAAuthorId);

        const newStory = await StoryService.createStory(storyData, sideAAuthorId);

        return res.status(201).json({
          message: `Conflict initiated successfully.`,
          story: newStory,
        });
      });

      // This starts the actual upload process
      blobStream.end(file.buffer);

    } catch (error) {
      console.error("Controller Error:", error);
      const statusCode = error.message.includes("required") ? 400 : 500;
      return res.status(statusCode).json({ error: error.message });
    }
  },
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
