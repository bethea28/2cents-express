const Story = require("./story.model");
const User = require('../user/user.model');
const { Op } = require("sequelize");
const { addHours } = require('date-fns');

class StoryService {
  // --- STAGE 1: THE CALL-OUT ---
  async createStory(storyData, sideAAuthorId) {
    try {
      const { title, wager, sideAContent, opponentHandle, sideAVideoUrl } = storyData;

      if (!sideAVideoUrl) throw new Error("A video rant is required.");

      const cleanUsername = opponentHandle.replace('@', '').trim();
      const opponent = await User.findOne({ where: { username: cleanUsername } });
      if (!opponent) throw new Error(`User "@${cleanUsername}" does not exist.`);

      const acceptanceDeadline = addHours(new Date(), 24);
      const finalTitle = title || `Beef over ${wager || 'nothing'}`;
      const slug = `${finalTitle.toLowerCase().trim().replace(/[^a-z0-9 ]/g, '').replace(/\s+/g, "-")}-${Date.now()}`;

      return await Story.create({
        title: finalTitle,
        slug,
        wager,
        sideAContent,
        sideAVideoUrl,
        sideAAuthorId,
        sideBAuthorId: opponent.id,
        status: "pending-acceptance", // Initial state
        expiresAt: acceptanceDeadline,
      });
    } catch (error) {
      console.error("Service Error:", error);
      throw error;
    }
  }

  // --- STAGE 2: ACTIVATE THE 72-HOUR ARENA ---
  async activateArena(storyId, userId, updateData) {
    try {
      const story = await Story.findByPk(storyId);
      if (!story) throw new Error("Story not found");

      // Safety Check: Only the tagged opponent can activate the arena
      if (story.sideBAuthorId !== userId) throw new Error("Unauthorized: You are not the opponent.");

      // THE 72-HOUR WINDOW START
      const votingDeadline = addHours(new Date(), 72);

      return await story.update({
        sideBVideoUrl: updateData.sideBVideoUrl,
        sideBAcknowledged: true,
        status: "active-voting", // Moves to the Arena
        votingEndsAt: votingDeadline, // Global Timer starts NOW
        rebuttalSubmittedAt: new Date()
      });
    } catch (error) {
      throw error;
    }
  }

  async acceptChallenge(storyId, userId) {
    try {
      // 1. Find the story
      const story = await Story.findByPk(storyId);

      if (!story) {
        throw new Error("Story not found");
      }

      // 2. Security Check: Only the targeted opponent (Side B) can accept
      if (story.sideBAuthorId !== userId) {
        throw new Error("Unauthorized: You are not the opponent in this challenge");
      }

      // 3. State Check: Ensure it hasn't already been accepted or expired
      if (story.status !== 'pending-acceptance') {
        throw new Error(`Cannot accept challenge in current status: ${story.status}`);
      }

      // 4. THE RESET: Calculate the new 24-hour deadline for the rebuttal video
      const newDeadline = addHours(new Date(), 24);

      // 5. Update the Record
      return await story.update({
        sideBAcknowledged: true,       // The boolean you asked about
        status: 'pending-rebuttal',    // The new state
        expiresAt: newDeadline         // The new 24h clock starts NOW
      });

    } catch (error) {
      console.error("Service Error - acceptChallenge:", error);
      throw error;
    }
  }

  // --- FEED LOGIC: THE PENDING INBOX ---
  async getAllPendingStories(userId) {
    return await Story.findAll({
      where: {
        sideBAuthorId: userId,
        status: ["pending-acceptance", "pending-rebuttal"] // Waiting for user action
      },
      include: [{ model: User, as: 'SideA', attributes: ['username', 'firstName'] }],
      order: [['createdAt', 'DESC']]
    });
  }
  // storyService.js
  async getStoryById(id) {
    console.log('story by id now', id)
    return await Story.findByPk(id);
  }
  // --- FEED LOGIC: THE GLOBAL ARENA (NEW) ---
  async getActiveArenaStories() {
    return await Story.findAll({
      where: {
        status: "active-voting" // These are the live 72-hour battles
      },
      order: [['votingEndsAt', 'ASC']] // Show the ones ending soonest first!
    });
  }

  // --- FEED LOGIC: COMPLETED BEEFS ---
  async getAllCompleteStories() {
    return await Story.findAll({
      where: {
        status: {
          // 🛠 ENGINEER: Use the exact ENUM values from your model.
          // 'complete' was a hallucination; 'settled' is the real value.
          [Op.in]: ['active-voting', 'settled']
        }
      },
      order: [['updatedAt', 'DESC']]
    });
  }
  // Generic update for minor edits
  // storyController.js
  async updateStory(storyId, updateData) {
    try {
      // 🛠 FIX: Call the MODEL (Story), not the SERVICE (StoryService)
      console.log('final story id', storyId)
      const story = await Story.findByPk(storyId);

      if (!story) throw new Error('Story not found');

      // Logic Check: Don't overwrite existing timestamp
      if (story.sideBViewedAt && updateData.sideBViewedAt) {
        delete updateData.sideBViewedAt;
      }

      return await story.update(updateData);
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new StoryService();