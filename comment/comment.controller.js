const CommentService = require("./comment.service");

const commentController = {
  // --- THE ARENA: POSTING A DISS ---
  async createComment(req, res) {
    try {
      const userId = req.user.id;
      const { storyId } = req.params; // From URL: /api/comments/:storyId
      const { content, parentId } = req.body;

      if (!content) {
        return res.status(400).json({ error: "Comment content cannot be empty." });
      }

      // 1. Call service to handle logic (and "Side" detection)
      const newComment = await CommentService.postComment({
        userId,
        storyId,
        content,
        parentId
      });

      // 2. Return the new comment with author details for immediate UI update
      return res.status(201).json({
        success: true,
        message: "Comment posted!",
        data: newComment
      });
    } catch (error) {
      console.error("Comment Controller Error:", error);
      return res.status(500).json({ error: error.message || "Internal Server Error" });
    }
  },

  // --- THE FEED: FETCHING THE TRASH TALK ---
  async getComments(req, res) {
    try {
      const { storyId } = req.params;
      const { page = 1, limit = 20 } = req.query;

      const result = await CommentService.fetchCommentsByStory(storyId, page, limit);

      return res.status(200).json({
        success: true,
        data: result.rows,
        totalCount: result.count,
        totalPages: Math.ceil(result.count / limit)
      });
    } catch (error) {
      console.error("Get Comments Error:", error);
      return res.status(500).json({ error: "Could not retrieve comments." });
    }
  }
};

module.exports = commentController;