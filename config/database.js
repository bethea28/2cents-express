// config/database.js
const { Sequelize } = require("sequelize");
require("dotenv").config();
const sequelize = new Sequelize(
  "2cents", // db name
  "bethea28", // username
  "", // password
  {
    host: process.env.DB_HOST || "localhost",
    port: process.env.DB_PORT || 5432,
    dialect: "postgres",
    logging: false,
    pool: {},
  }
);
// (Optional) Test the connection
async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log("Database connection successful.");
  } catch (error) {
    console.error("Database connection failed:", error);
  }
}
testConnection();
module.exports = sequelize;
