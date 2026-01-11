// auth/auth.service.js
"use strict";

const { Sequelize } = require("sequelize");
const User = require("../user/user.model");
const bcrypt = require("bcrypt");

const authService = {

  /**
   * 🛡️ STAGE 1: Google Identity Sync
   * This is strictly for finding or creating a user based on Google data.
   */
  async syncGoogleUser({ uid, email, username, profilePic }) {
    try {
      const [user, created] = await User.findOrCreate({
        where: { email: email.toLowerCase().trim() },
        defaults: {
          uid,
          username: username.replace(/\s+/g, '').toLowerCase(),
          email: email.toLowerCase().trim(),
          profilePic,
          // Generate a random password since they use Google, but hash it anyway
          password: await bcrypt.hash(Math.random().toString(36), 10)
        }
      });

      // If the user existed but we didn't have their UID yet, sync it
      if (!created && !user.uid) {
        user.uid = uid;
        await user.save();
      }

      // 🛡️ RETURN THE INSTANCE: This allows the controller to call .update()
      return { user, isNewUser: created };
    } catch (error) {
      console.error("❌ Service Error (syncGoogleUser):", error.message);
      throw error;
    }
  },

  /**
   * 🛡️ STAGE 2: Manual Registration
   */
  async registerUser({ username, email, password, profilePic }) {
    try {
      const existingUser = await User.findOne({
        where: { [Sequelize.Op.or]: [{ username }, { email }] },
      });

      if (existingUser) {
        throw new Error("Username or email already exists");
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const newUser = await User.create({
        username,
        email,
        password: hashedPassword,
        profilePic,
      });

      return newUser; // Returns the live Sequelize instance
    } catch (error) {
      console.error("❌ Service Error (registerUser):", error);
      throw error;
    }
  },

  /**
   * 🛡️ STAGE 3: Credential Login
   * Checks the password and returns the user instance.
   */
  async loginUser(email, password) {
    try {
      // Find the user and include the password for comparison
      const user = await User.findOne({
        where: { email: email.toLowerCase().trim() },
        attributes: ["id", "username", "email", "password", "profilePic"],
      });

      if (!user) return null;

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return null;

      // 🛡️ STAFF NOTE: We removed the token generation here. 
      // The controller will handle the JWT signing.
      return user;
    } catch (error) {
      console.error("❌ Service Error (loginUser):", error.message);
      throw error;
    }
  },
};

module.exports = authService;