const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const User = require("../user/user.model");
const Image = require("../image/image.model");

const Story = sequelize.define(
  "Story",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    wager: { // NEW: To store the stakes of the beef
      type: DataTypes.STRING,
      allowNull: true,
    },
    slug: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: true,
    },
    storyType: { // UPDATED: Added call-out
      type: DataTypes.ENUM("one-sided", "two-sided", "call-out"),
      allowNull: true,
      defaultValue: "call-out",
    },
    sideAContent: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    sideAVideoUrl: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    sideAAuthorId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: User, key: "id" },
    },
    sideAAcknowledged: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    sideBContent: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    sideBVideoUrl: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    sideBAuthorId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: User, key: "id" },
    },
    sideBAcknowledged: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    status: { // UPDATED: Added pending-response
      type: DataTypes.ENUM("draft", "pending-response", "complete", "archived"),
      allowNull: false,
      defaultValue: "pending-response",
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  {}
);

// ... keep all your Image and User associations exactly as they are below ...
// Define associations with the User model
// Story.belongsTo(User, { foreignKey: "sideAAuthorId", as: "sideAAuthor" });
// Story.belongsTo(User, { foreignKey: "sideBAuthorId", as: "sideBAuthor" });
// Story belongs to the creator (Side A)
Story.belongsTo(User, { as: 'SideA', foreignKey: 'sideAAuthorId' });

// Story belongs to the opponent (Side B)
Story.belongsTo(User, { as: 'SideB', foreignKey: 'sideBAuthorId' });

// Add these to fully complete the loop
User.hasMany(Story, { foreignKey: 'sideAAuthorId', as: 'StartedStories' });
User.hasMany(Story, { foreignKey: 'sideBAuthorId', as: 'ReceivedChallenges' });
// Optional: User can have many stories they started
// Define many-to-many relationship for Side A images
const SideAImage = sequelize.define("SideAImage", {
  storyId: {
    type: DataTypes.INTEGER,
    references: {
      model: Story,
      key: "id",
    },
    primaryKey: true,
  },
  imageId: {
    type: DataTypes.INTEGER,
    references: {
      model: Image,
      key: "id",
    },
    primaryKey: true,
  },
  // You can add attributes specific to this association (e.g., order)
});

Story.belongsToMany(Image, {
  through: SideAImage,
  as: "sideAImages",
  foreignKey: "storyId",
});
Image.belongsToMany(Story, {
  through: SideAImage,
  as: "sideAStories",
  foreignKey: "imageId",
});

// Define many-to-many relationship for Side B images
const SideBImage = sequelize.define("SideBImage", {
  storyId: {
    type: DataTypes.INTEGER,
    references: {
      model: Story,
      key: "id",
    },
    primaryKey: true,
  },
  imageId: {
    type: DataTypes.INTEGER,
    references: {
      model: Image,
      key: "id",
    },
    primaryKey: true,
  },
  // You can add attributes specific to this association (e.g., order)
});

Story.belongsToMany(Image, {
  through: SideBImage,
  as: "sideBImages",
  foreignKey: "storyId",
});
Image.belongsToMany(Story, {
  through: SideBImage,
  as: "sideBStoriesB",
  foreignKey: "imageId",
});

module.exports = Story;
