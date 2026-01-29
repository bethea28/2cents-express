const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const User = require("../user/user.model");
const Story = require("../story/story.model"); // Assuming they are in the same folder

const Vote = sequelize.define("Vote", {
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
  storyId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: Story, key: "id" },
  },
  side: {
    type: DataTypes.ENUM("A", "B"),
    allowNull: false,
  }
}, {
  indexes: [
    {
      // 🛠 ENGINEER: This is the most important part. 
      // It prevents one user from voting on the same story twice.
      unique: true,
      fields: ['userId', 'storyId']
    }
  ]
});

// Associations
Vote.belongsTo(User, { foreignKey: 'userId' });
Vote.belongsTo(Story, { foreignKey: 'storyId' });
Story.hasMany(Vote, { foreignKey: 'storyId', as: 'votes' });

module.exports = Vote;