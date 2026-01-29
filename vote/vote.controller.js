// vote.controller.js
const VoteService = require("./vote.service");

const voteController = {
  // --- STAGE 3: THE ARENA (User casts their judgment) ---
  async castVote(req, res) {
    try {
      const userId = req.user.id; // The voter
      const { storyId, side } = req.body;
      console.log('vote data', storyId, side)
      if (!storyId || !side) {
        return res.status(400).json({ error: "Story ID and Side (A or B) are required." });
      }

      // 1. Call the service to handle the transaction
      const updatedStory = await VoteService.castVote(storyId, userId, side);

      // 2. Return updated story so frontend can "Shock" the meter immediately
      return res.status(201).json({
        success: true,
        message: "Vote recorded!",
        data: updatedStory
      });
    } catch (error) {
      console.error("Vote Controller Error:", error);

      // Handle the unique constraint (User already voted)
      if (error.name === 'SequelizeUniqueConstraintError' || error.message.includes("already voted")) {
        return res.status(400).json({ error: "You have already cast your vote for this battle." });
      }

      return res.status(500).json({ error: error.message || "Internal Server Error" });
    }
  }
};

module.exports = voteController;