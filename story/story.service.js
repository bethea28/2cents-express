// story.service.js
const Story = require("./story.model");
const { Op } = require("sequelize");

class StoryService {
  async createStory(storyData) {
    try {
      const {
        title,
        sideAContent,
        sideBContent,
        sideAAuthorId,
        sideBAuthorId,
        storyType = "one-sided",
        // sideBAuthorId: dataSideBAuthorId,
      } = storyData;
      console.log("INSDIE CREATE STOREY SIDE A", storyData);
      // return;
      if (!title || !sideAContent) {
        throw new Error("Title and content for Side A are required.");
      }

      // if (storyType === "two-sided" && !sideBContent) {
      //   throw new Error(
      //     "Content for Side B is required for a two-sided story."
      //   );
      // }

      const slug = title
        .toLowerCase()
        .replace(/ /g, "-")
        .replace(/[^\w-]+/g, "");
      const existingSlug = await Story.findOne({ where: { slug } });
      if (existingSlug) {
        throw new Error("A story with this title already exists.");
      }

      const newStory = await Story.create({
        title,
        slug,
        storyType,
        sideAContent,
        sideBContent: sideBContent || null,
        sideAAuthorId,
        sideBAuthorId: sideBAuthorId || null,
        // sideBAuthorId: dataSideBAuthorId || null,
        status:
          storyType === "one-sided"
            ? "complete"
            : sideBContent
            ? "complete"
            : "pending-second",
      });
      console.log("WE ARE AT THE END");
      return newStory; // Return the created story data
    } catch (error) {
      console.error("Error in StoryService.createStory:", error);
      throw error;
    }
  }

  async getAllStories(storyData, sideAAuthorId) {
    try {
      const newStory = await Story.findAll({ where: { status: "complete" } });
      console.log("GET ALL STORIES onesided stores", newStory);
      return newStory; // Return the created story data
    } catch (error) {
      console.error("Error in StoryService.createStory:", error);
      throw error;
    }
  }
  async getAllPendingStories(req, res) {
    const userId = req.params.userId;
    console.log("DOWN TO THE ROOT USERID", req.params);
    try {
      const newStory = await Story.findAll({
        where: {
          sideAAuthorId: userId,
          status: {
            [Op.not]: "complete",
          },
        },
      });
      console.log("GET ALL STORIES onesided stores", newStory);
      return newStory; // Return the created story data
    } catch (error) {
      console.error("Error in StoryService.createStory:", error);
      throw error;
    }
  }
}

module.exports = new StoryService();
