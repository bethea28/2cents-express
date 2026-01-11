const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const User = require("../user/user.model");
const Comment = require("../comment/comment.model"); // 🛠 Swapped Story for Comment

const Like = sequelize.define("Like", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: User, key: "id" },
  },
  commentId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: Comment, key: "id" },
  }
  // 🛠 ENGINEER: Notice 'side' is removed. A like is just a record 
  // of existence between a user and a comment.
}, {
  indexes: [
    {
      // 🛠 ENGINEER: This prevents the "Infinite Heat" bug.
      // One user can only like a specific comment exactly once.
      unique: true,
      fields: ['userId', 'commentId']
    }
  ]
});

// Associations
Like.belongsTo(User, { foreignKey: 'userId' });
Like.belongsTo(Comment, { foreignKey: 'commentId' });

// 🛠 This allows you to do Comment.findAll({ include: 'likes' })
Comment.hasMany(Like, { foreignKey: 'commentId', as: 'likes' });

module.exports = Like;