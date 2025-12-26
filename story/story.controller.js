const bucket = require("../firebase.config"); // Import your Firebase bucket
const StoryService = require("./story.service");

const storyController = {
  async createStory(req, res) {
    try {
      const file = req.file;
      const { title, opponentHandle, stake, storyType } = req.body; // Destructure the new fields

      if (!file) {
        return res.status(400).json({ error: "Video file is required." });
      }

      // 1. Prepare Firebase path
      const fileName = `videos/${Date.now()}_${file.originalname}`;
      const fileUpload = bucket.file(fileName);

      const blobStream = fileUpload.createWriteStream({
        metadata: { contentType: file.mimetype },
      });

      blobStream.on("error", (error) => {
        console.error("Firebase Upload Error:", error);
        return res.status(500).json({ error: "Cloud storage upload failed." });
      });

      blobStream.on("finish", async () => {
        // 2. Public Firebase URL
        const publicUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(fileName)}?alt=media`;

        // 3. Prepare data for the Service Layer
        const storyData = {
          title: title,
          opponentHandle: opponentHandle,
          wager: stake, // Ensure your DB column name (wager) matches this mapping
          storyType: storyType, // Will be 'call-out'
          sideAVideoUrl: publicUrl,
        };

        // Use the ID from the logged-in user (JWT/Session)
        const sideAAuthorId = req.user.id;

        // try {
        //   const newStory = await StoryService.createStory(storyData, sideAAuthorId);
        //   return res.status(201).json({
        //     message: `Conflict initiated successfully.`,
        //     story: newStory,
        //   });
        // } catch (dbError) {
        //   console.error("Database Error:", dbError);
        //   return res.status(400).json({ error: dbError.message });
        // }

        // Inside storyController.js
        try {
          const newStory = await StoryService.createStory(storyData, sideAAuthorId);
          return res.status(201).json(newStory);
        } catch (dbError) {
          console.error("Database Error:", dbError);
          // This sends "User @dan does not exist" back to the app
          return res.status(400).json({ error: dbError.message });
        }
      });

      blobStream.end(file.buffer);

    } catch (error) {
      console.error("Controller Error:", error);
      return res.status(500).json({ error: error.message });
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
