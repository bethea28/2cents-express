// like.controller.js
const LikeService = require("./like.service");

const likeController = {
  async toggleLike(req, res) {
    try {
      const userId = req.user.id;
      const { id: commentId } = req.params; // From route /:id/like

      if (!commentId) {
        return res.status(400).json({ error: "Comment ID is required." });
      }

      // 1. Call service to handle the toggle logic
      const result = await LikeService.toggleLike(commentId, userId);

      // 2. Return the toggle status and updated count
      return res.status(200).json({
        success: true,
        message: result.isLiked ? "Heat added!" : "Heat removed!",
        data: {
          commentId,
          isLiked: result.isLiked,
          likesCount: result.likesCount
        }
      });
    } catch (error) {
      console.error("Like Controller Error:", error);
      return res.status(500).json({ error: error.message || "Internal Server Error" });
    }
  }
};

module.exports = likeController;