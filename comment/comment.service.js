const Comment = require("./comment.model");
const Vote = require("../vote/vote.model");
const User = require("../user/user.model");

const CommentService = {
  async postComment({ userId, storyId, content, parentId }) {
    // 🛠 ENGINEER: Check the "Vote" table to see which side this user is on
    const userVote = await Vote.findOne({ where: { userId, storyId } });

    // If they haven't voted, they are 'Neutral'
    const side = userVote ? userVote.side : 'Neutral';

    const comment = await Comment.create({
      userId,
      storyId,
      content,
      parentId,
      side
    });

    // Re-fetch with User details so the frontend has the username/avatar immediately
    return await Comment.findByPk(comment.id, {
      include: [{ model: User, as: 'author', attributes: ['username', 'profilePic'] }]
    });
  },

  async fetchCommentsByStory(storyId, page, limit) {
    const offset = (page - 1) * limit;
    return await Comment.findAndCountAll({
      where: { storyId, parentId: null }, // Top-level only
      include: [
        { model: User, as: 'author', attributes: ['username', 'profilePic'] },
        // Nested replies preview (Optional)
        {
          model: Comment,
          as: 'replies',
          limit: 3,
          include: [{ model: User, as: 'author', attributes: ['username'] }]
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
  }
};

module.exports = CommentService;