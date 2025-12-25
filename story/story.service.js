
const Story = require("./story.model");
const { Op } = require("sequelize");

class StoryService {
  async createStory(storyData, sideAAuthorId) {
    try {
      const {
        title,
        wager,
        sideAContent,
        sideBAuthorId, // The ID of the person being called out
        sideAVideoUrl,
        storyType = "call-out",
      } = storyData;

      // 1. Basic Validation
      if (!sideAVideoUrl) {
        throw new Error("A video rant is required to start a conflict.");
      }

      // If no title, generate a default one based on the wager
      const finalTitle = title || `Beef over ${wager || 'nothing'}`;

      // 2. Slug Generation (Unique drama link)
      const slug = `${finalTitle.toLowerCase().replace(/ /g, "-")}-${Date.now()}`;

      // 3. Create the Database Record
      const newStory = await Story.create({
        title: finalTitle,
        slug,
        wager,
        storyType,
        sideAContent,
        sideAVideoUrl,
        sideAAuthorId,
        sideBAuthorId: sideBAuthorId || null,
        // Start as 'pending-response' until the opponent records their side
        status: "pending-response",
      });

      return newStory;
    } catch (error) {
      console.error("Service Error:", error);
      throw error;
    }
  }
}

module.exports = new StoryService();


// // story.service.js
// const Story = require("./story.model");
// const { Op } = require("sequelize");

// class StoryService {
//   async createStory(storyData) {
//     try {
//       const {
//         title,
//         sideAContent,
//         sideBContent,
//         sideAAuthorId,
//         sideBAuthorId,
//         storyType = "one-sided",
//         // sideBAuthorId: dataSideBAuthorId,
//       } = storyData;
//       console.log("INSDIE CREATE STOREY SIDE A", storyData);
//       // return;
//       if (!title || !sideAContent) {
//         throw new Error("Title and content for Side A are required.");
//       }

//       // if (storyType === "two-sided" && !sideBContent) {
//       //   throw new Error(
//       //     "Content for Side B is required for a two-sided story."
//       //   );
//       // }

//       const slug = title
//         .toLowerCase()
//         .replace(/ /g, "-")
//         .replace(/[^\w-]+/g, "");
//       const existingSlug = await Story.findOne({ where: { slug } });
//       if (existingSlug) {
//         throw new Error("A story with this title already exists.");
//       }

//       const newStory = await Story.create({
//         title,
//         slug,
//         storyType,
//         sideAContent,
//         sideBContent: sideBContent || null,
//         sideAAuthorId,
//         sideBAuthorId: sideBAuthorId || null,
//         // sideBAuthorId: dataSideBAuthorId || null,
//         status:
//           storyType === "one-sided"
//             ? "complete"
//             : sideBContent
//             ? "complete"
//             : "pending-second",
//       });
//       console.log("WE ARE AT THE END");
//       return newStory; // Return the created story data
//     } catch (error) {
//       console.error("Error in StoryService.createStory:", error);
//       throw error;
//     }
//   }

//   async getAllStories(storyData, sideAAuthorId) {
//     try {
//       const newStory = await Story.findAll({ where: { status: "complete" } });
//       console.log("GET ALL STORIES onesided stores", newStory);
//       return newStory; // Return the created story data
//     } catch (error) {
//       console.error("Error in StoryService.createStory:", error);
//       throw error;
//     }
//   }
//   async getAllPendingStories(req, res) {
//     const userId = req.params.userId;
//     console.log("DOWN TO THE ROOT USERID", req.params);
//     try {
//       const newStory = await Story.findAll({
//         where: {
//           sideAAuthorId: userId,
//           status: {
//             [Op.not]: "complete",
//           },
//         },
//       });
//       console.log("GET ALL STORIES onesided stores", newStory);
//       return newStory; // Return the created story data
//     } catch (error) {
//       console.error("Error in StoryService.createStory:", error);
//       throw error;
//     }
//   }
// }

// module.exports = new StoryService();
