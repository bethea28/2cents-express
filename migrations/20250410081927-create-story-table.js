"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Stories", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      title: {
        type: Sequelize.STRING,
        allowNull: true, // Changed to true to match model
      },
      slug: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: true,
      },
      storyType: {
        type: Sequelize.ENUM("one-sided", "two-sided"),
        allowNull: true,
        defaultValue: "one-sided",
      },
      sideAContent: {
        type: Sequelize.TEXT,
        allowNull: true, // Changed to true to match model
      },
      sideAVideoUrl: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      sideAAuthorId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "users", // Assuming your user model is named 'User' and table is 'users'
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      sideAAcknowledged: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      sideBContent: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      sideBVideoUrl: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      sideBAuthorId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "users", // Assuming your user model is named 'User' and table is 'users'
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      sideBAcknowledged: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      status: {
        type: Sequelize.ENUM("draft", "pending-second", "complete", "archived"),
        allowNull: false,
        defaultValue: "draft",
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("Stories");
  },
};
