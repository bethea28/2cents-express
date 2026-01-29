const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    // ⚓ THE ANCHOR: The permanent Firebase/Google ID
    uid: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: true,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        len: [3, 30],
      },
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    profilePic: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: "https://via.placeholder.com/150",
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    refreshToken: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    // 🥩 THE BEEF KEY: Stores the ExponentPushToken[xxx]
    // We use STRING because Expo tokens are typically short, 
    // but you can use TEXT if you plan to support multiple devices later.
    pushToken: {
      type: DataTypes.STRING,
      allowNull: true, // true because not everyone will grant notification permissions
    },
  },
  {
    sequelize,
    tableName: "users",
    timestamps: true,
    defaultScope: {
      attributes: { exclude: ["password"] },
    },
    scopes: {
      withPassword: {
        attributes: {},
      },
    },
  }
);

module.exports = User;