const StoryService = require("./story.service"); // Adjust path as needed

const storyController = {
  async createStory(req, res) {
    try {
      const storyData = req.body;
      const sideAAuthorId = req.user.id; // Assuming your JWT middleware populates req.user

      console.log("req body now nick just req", req);
      console.log("ALL STORY DATA NOW ", storyData);
      // return;
      const newStory = await StoryService.createStory(storyData, sideAAuthorId);

      return res.status(201).json({
        message: `Story created successfully (${newStory.storyType}).`,
        story: newStory,
      });
    } catch (error) {
      console.error("Error creating story:", error);
      let statusCode = 500;
      if (
        error.message.includes("required") ||
        error.message.includes("Invalid")
      ) {
        statusCode = 400;
      } else if (error.message.includes("already exists")) {
        statusCode = 409;
      }
      return res.status(statusCode).json({ error: error.message });
    }
  },
  async getAllStories(req, res) {
    try {
      // const storyData = req.body;
      // const sideAAuthorId = req.user.id; // Assuming your JWT middleware populates req.user

      console.log("req body now nick");
      // console.log("USER ID NOW nicky ", storyData);
      const newStory = await StoryService.getAllStories();

      return res.status(201).json({
        message: `Got all stories`,
        allStories: newStory,
      });
    } catch (error) {
      console.error("Error creating story:", error);
      let statusCode = 500;
      if (
        error.message.includes("required") ||
        error.message.includes("Invalid")
      ) {
        statusCode = 400;
      } else if (error.message.includes("already exists")) {
        statusCode = 409;
      }
      return res.status(statusCode).json({ error: error.message });
    }
  },
  async getAllPendingStories(req, res) {
    try {
      // return;
      // const storyData = req.body;
      // const sideAAuthorId = req.user.id; // Assuming your JWT middleware populates req.user
      const userId = req.params;
      console.log("step one again", userId);
      // console.log("USER ID NOW nicky ", storyData);
      const newStory = await StoryService.getAllPendingStories(req, res);
      console.log("PENDING STORIES NOW", newStory);
      return res.status(201).json({
        message: `Got all Pending stories`,
        allPendingStories: newStory,
      });
    } catch (error) {
      console.error("Error creating story:", error);
      let statusCode = 500;
      if (
        error.message.includes("required") ||
        error.message.includes("Invalid")
      ) {
        statusCode = 400;
      } else if (error.message.includes("already exists")) {
        statusCode = 409;
      }
      return res.status(statusCode).json({ error: error.message });
    }
  },
};

module.exports = storyController;
