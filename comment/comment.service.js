const Comment = require("./comment.model");
const Vote = require("../vote/vote.model");
const User = require("../user/user.model");

class CommentService {
  // Method 1: Posting the Diss
  async postComment({ userId, storyId, content, parentId, side }) {    // 🛠 ENGINEER: Always wrap DB operations in try/catch or handle them in the controller
    const userVote = await Vote.findOne({ where: { userId, storyId } });

    // If they haven't voted, they are 'Neutral'
    // const side = userVote ? userVote.side : 'Neutral';

    const comment = await Comment.create({
      userId,
      storyId,
      content,
      parentId: parentId || null,
      side: side || 'Neutral' // Fallback just in case
    });

    // Re-fetch with User details
    return await Comment.findByPk(comment.id, {
      include: [{ model: User, as: 'author', attributes: ['username', 'profilePic'] }]
    })
  } // <-- REMOVED COMMA (Classes use method syntax, not object syntax)

  // Method 2: Getting the Feed
  async fetchCommentsByStory(storyId, page, limit) {
    const parsedLimit = parseInt(limit) || 20;
    const parsedPage = parseInt(page) || 1;
    const offset = (parsedPage - 1) * parsedLimit;

    return await Comment.findAndCountAll({
      where: { storyId, parentId: null },
      include: [
        { model: User, as: 'author', attributes: ['username', 'profilePic'] },
        {
          model: Comment,
          as: 'replies',
          limit: 3,
          include: [{ model: User, as: 'author', attributes: ['username', 'profilePic'] }]
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: parsedLimit,
      offset: offset
    });
  }
}

// Exporting a SINGLETON (one instance for the whole app)
module.exports = new CommentService();