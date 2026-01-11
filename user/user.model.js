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
      allowNull: true, // true because your old manual users won't have one
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
    // 🛡️ STAFF FIX: Changed allowNull to true to support Google Users
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
      type: DataTypes.TEXT, // 🛡️ Use TEXT because JWTs can be long strings
      allowNull: true,
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

// const { DataTypes } = require("sequelize");
// const sequelize = require("../config/database");

// const User = sequelize.define(
//   "User",
//   {
//     id: {
//       type: DataTypes.INTEGER,
//       primaryKey: true,
//       autoIncrement: true,
//     },
//     username: {
//       type: DataTypes.STRING,
//       allowNull: false,
//       unique: true,
//       validate: {
//         len: [3, 30],
//       },
//     },
//     email: {
//       type: DataTypes.STRING,
//       allowNull: false,
//       unique: true,
//       validate: {
//         isEmail: true,
//       },
//     },
//     password: {
//       type: DataTypes.STRING,
//       allowNull: false,
//     },
//     profilePic: {
//       type: DataTypes.STRING,
//       allowNull: true,
//       defaultValue: "https://via.placeholder.com/150", // Standard fallback
//     },
//     firstName: {
//       type: DataTypes.STRING,
//       allowNull: true,
//     },
//     lastName: {
//       type: DataTypes.STRING,
//       allowNull: true,
//     },
//   },
//   {
//     sequelize,
//     tableName: "users",
//     timestamps: true, // Crucial for tracking when users joined
//     defaultScope: {
//       attributes: { exclude: ["password"] }, // Security: hide password by default
//     },
//     scopes: {
//       withPassword: {
//         attributes: {},
//       },
//     },
//   }
// );

// module.exports = User;