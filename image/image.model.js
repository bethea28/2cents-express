// image.model.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Image = sequelize.define("Image", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  url: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  // You can add other metadata like caption, order, etc.
});
module.exports = Image;
