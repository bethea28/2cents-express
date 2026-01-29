const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const User = require("../user/user.model");
const Story = require("../story/story.model");

const Comment = sequelize.define("Comment", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  content: {
    type: DataTypes.STRING(500), // Honest opinion: 500 chars is plenty for a "Diss"
    allowNull: false,
  },
  side: {
    // We keep this to show which "team" the commenter belongs to
    type: DataTypes.ENUM("A", "B", "Neutral"),
    defaultValue: "Neutral",
    allowNull: false,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: User, key: "id" },
  },
  storyId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: Story, key: "id" },
  },
  parentId: {
    // 🛠 ENGINEER: This allows for "Replies." 
    // If null, it's a top-level comment. If it has an ID, it's a reply.
    type: DataTypes.INTEGER,
    allowNull: true,
    references: { model: "Comments", key: "id" },
  },
  likesCount: {
    // 🛠 ENGINEER: Cache the likes so we don't have to count them every time.
    type: DataTypes.INTEGER,
    defaultValue: 0,
  }
}, {
  tableName: "Comments",
  indexes: [
    {
      // 🚀 PERFORMANCE: Essential for loading comments for a story quickly
      fields: ['storyId']
    },
    {
      // 🚀 PERFORMANCE: Needed if you ever want to show "User History"
      fields: ['userId']
    }
  ]
});

// Associations
Comment.belongsTo(User, { foreignKey: 'userId', as: 'author' });
Comment.belongsTo(Story, { foreignKey: 'storyId' });
Story.hasMany(Comment, { foreignKey: 'storyId', as: 'comments' });

// Self-association for threading
Comment.hasMany(Comment, { foreignKey: 'parentId', as: 'replies' });
Comment.belongsTo(Comment, { foreignKey: 'parentId', as: 'parent' });

module.exports = Comment;