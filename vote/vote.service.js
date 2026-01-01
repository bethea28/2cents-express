// vote.service.js
const Vote = require("./vote.model");
const Story = require("../story/story.model");
const sequelize = require("../config/database");

class VoteService {
  async castVote(storyId, userId, newSide) {
    return await sequelize.transaction(async (t) => {
      // 1. Find existing vote
      const existingVote = await Vote.findOne({
        where: { storyId, userId },
        transaction: t
      });

      const story = await Story.findByPk(storyId, { transaction: t });
      if (!story) throw new Error("Battle not found.");

      if (!existingVote) {
        // FIRST TIME VOTING
        await Vote.create({ storyId, userId, side: newSide }, { transaction: t });
        const field = newSide === 'A' ? 'challengerVotes' : 'rebuttalVotes';
        await story.increment(field, { by: 1, transaction: t });
      }
      else if (existingVote.side !== newSide) {
        // SWITCHING SIDES
        const oldField = existingVote.side === 'A' ? 'challengerVotes' : 'rebuttalVotes';
        const newField = newSide === 'A' ? 'challengerVotes' : 'rebuttalVotes';

        // Update the vote record
        existingVote.side = newSide;
        await existingVote.save({ transaction: t });

        // Atomically adjust both counters
        await story.decrement(oldField, { by: 1, transaction: t });
        await story.increment(newField, { by: 1, transaction: t });
      } else {
        // Tapping the same side again
        throw new Error("You are already on this team!");
      }

      return await story.reload({ transaction: t });
    });
  }
}

module.exports = new VoteService();