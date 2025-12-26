
const Story = require("./story.model");
const User = require('../user/user.model');
const { Op } = require("sequelize");


class StoryService {
  async createStory(storyData, sideAAuthorId) {
    try {
      const {
        title,
        wager,
        sideAContent,
        opponentHandle, // The @handle from the frontend
        sideAVideoUrl,
        storyType = "call-out",
      } = storyData;
      console.log('all story data', storyData)
      // return
      // 1. Basic Validation
      if (!sideAVideoUrl) {
        throw new Error("A video rant is required to start a conflict.");
      }

      // 2. Opponent Lookup (Linking @username to sideBAuthorId)
      let sideBAuthorId = null;
      if (opponentHandle) {
        // Remove '@' and whitespace
        const cleanUsername = opponentHandle.replace('@', '').trim();

        // Search the 'username' column (matching your User model)
        const opponent = await User.findOne({
          where: { username: cleanUsername }
        });

        if (opponent) {
          sideBAuthorId = opponent.id;
        } else {
          // Log it, but don't necessarily crash unless you want to require the user exists
          console.log(`⚠️ User "${cleanUsername}" not found. Story created as unlinked.`);
        }
      }

      // Inside StoryService.js
      if (opponentHandle) {
        const cleanUsername = opponentHandle.replace('@', '').trim();
        const opponent = await User.findOne({ where: { username: cleanUsername } });

        if (opponent) {
          sideBAuthorId = opponent.id;
        } else {
          // THROW AN ERROR instead of just logging it
          throw new Error(`User "@${cleanUsername}" does not exist. Please check the spelling.`);
        }
      }

      // 3. Title & Slug Logic
      // Fallback if title is empty
      const finalTitle = title || `Beef over ${wager || 'nothing'}`;

      // Generate URL-safe slug: "My Lunch?!" -> "my-lunch-1735161600"
      const slug = `${finalTitle
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9 ]/g, '') // Remove symbols
        .replace(/\s+/g, "-")       // Replace spaces with hyphens
        }-${Date.now()}`;

      // 4. Create the Database Record
      const newStory = await Story.create({
        title: finalTitle,
        slug,
        wager, // Mapped from 'stake' in your controller
        storyType, // Now matches 'call-out'
        sideAContent,
        sideAVideoUrl,
        sideAAuthorId, // The logged-in user's ID
        sideBAuthorId, // The ID found in Step 2
        status: "pending-response",
      });

      return newStory;
    } catch (error) {
      console.error("Service Error:", error);
      throw error;
    }
  }
  async getAllPendingStories(userId) {
    console.log('gettinga all pending stories for user', userId)
    return await Story.findAll({
      where: {
        sideBAuthorId: userId,
        status: "pending-response"
      },
      include: [{
        model: User,
        as: 'SideA', // This assumes you have the 'belongsTo' association set up in your models
        attributes: ['username', 'firstName'] // Only get the info you need for the UI
      }],
      order: [['createdAt', 'DESC']]
    });
  }
  async updateStory(storyId, updateData) {
    console.log('Updating story record:', storyId);
    try {
      const story = await Story.findByPk(storyId);

      if (!story) {
        throw new Error('Story not found');
      }

      // Apply the updates (e.g., sideBAcknowledged: true)
      return await story.update(updateData);
    } catch (error) {
      console.error("Service Error updating story:", error);
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
