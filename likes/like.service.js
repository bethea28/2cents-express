// like.service.js
const Like = require("./like.model");
const Comment = require("../comment/comment.model");
const sequelize = require("../config/database");

class LikeService {
  async toggleLike(commentId, userId) {
    return await sequelize.transaction(async (t) => {
      // 1. Check for existing like
      const existingLike = await Like.findOne({
        where: { commentId, userId },
        transaction: t
      });

      const comment = await Comment.findByPk(commentId, { transaction: t });
      if (!comment) throw new Error("Comment not found.");

      let isLiked = false;

      if (existingLike) {
        // UNLIKE: Remove record and decrement
        await existingLike.destroy({ transaction: t });
        await comment.decrement('likesCount', { by: 1, transaction: t });
        isLiked = false;
      } else {
        // LIKE: Create record and increment
        await Like.create({ commentId, userId }, { transaction: t });
        await comment.increment('likesCount', { by: 1, transaction: t });
        isLiked = true;
      }

      // 2. Reload to get the fresh count after increment/decrement
      const updatedComment = await comment.reload({ transaction: t });

      return {
        isLiked,
        likesCount: updatedComment.likesCount
      };
    });
  }
}

module.exports = new LikeService();