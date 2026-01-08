const CommentService = require("./comment.service");
const Comment = require("./comment.model"); // Ensure this is imported
const User = require("../user/user.model");

const commentController = {
  async createComment(req, res) {
    try {
      const userId = req.user.id;
      // 1. Get storyId from URL params (/api/comments/:storyId)
      const { storyId } = req.params;

      // 2. 🛠 FIX: Removed 'storyId' from body to avoid shadowing the one above
      const { content, side, parentId } = req.body;

      if (!content) {
        return res.status(400).json({ error: "Comment content cannot be empty." });
      }

      // 3. Create the comment
      const newComment = await Comment.create({
        content,
        storyId,
        userId,
        side: side || 'Neutral',
        parentId: parentId || null // 🛠 This now correctly maps to your database
      });

      // 4. 🛠 PRO TIP: Fetch the author so the frontend shows the username immediately
      const commentWithAuthor = await Comment.findByPk(newComment.id, {
        include: [{
          model: User,
          as: 'author',
          attributes: ['username', 'profilePic']
        }]
      });

      return res.status(201).json({
        success: true,
        message: "Comment posted!",
        data: commentWithAuthor
      });
    } catch (error) {
      console.error("Comment Controller Error:", error);
      return res.status(500).json({ error: error.message || "Internal Server Error" });
    }
  },

  async getComments(req, res) {
    try {
      const { storyId } = req.params;
      const { page = 1, limit = 50 } = req.query; // Raised limit to ensure all replies are fetched

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