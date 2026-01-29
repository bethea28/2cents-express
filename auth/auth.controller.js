"use strict";

const authService = require("./auth.service");
const jwt = require("jsonwebtoken");
const { User } = require("../user/user.model"); // 🛡️ STAFF: Adjust path to your actual User model
const userService = require("../User/user.service");

const authController = {
  /**
   * STAGE 1: The Google Sync (The "Upsert" Flow)
   * Handles both new Google signups and returning Google users.
   */
  async googleSync(req, res) {
    console.log("🚀 GOOGLE SYNC ATTEMPT:", req.body);
    try {
      const { uid, email, displayName, photoURL } = req.body;

      if (!email || !uid) {
        return res.status(400).json({ error: "Missing Google Identity data." });
      }

      // 1. Sync user data with the DB via the service
      const { user, isNewUser } = await authService.syncGoogleUser({
        uid,
        email: email.toLowerCase().trim(),
        username: displayName || `User_${uid.substring(0, 5)}`,
        profilePic: photoURL
      });

      // 2. Generate Backend Tokens
      const token = jwt.sign(
        { id: user.id },
        process.env.ACCESS_TOKEN_SECRET || "your_fallback_secret",
        { expiresIn: "7d" } // 🛡️ Longer session for mobile convenience
      );

      const refreshToken = jwt.sign(
        { id: user.id },
        process.env.REFRESH_TOKEN_SECRET || "your_fallback_refresh_secret"
      );

      console.log('REFRESTH TOKEN', refreshToken)
      if (user && user.id) {
        await userService.updateUser(user.id, { refreshToken });
      } else {
        console.error("Cannot update user: No valid user ID found.");
      }
      // ✅ CORRECT: The first argument is the ID, the second is the data object.
      // 🛡️ STAFF FIX: Save the refresh token to the database
      // This allows us to verify the session during the "Refresh" flow later.
      // await userService.updateUser(user.id, { refreshToken: refreshToken });
      // await userService.updateUser(
      //   { refreshToken: refreshToken },
      //   { where: { id: user.id } }
      // );

      console.log(`✅ GOOGLE SYNC SUCCESS: ${user.email} (New: ${isNewUser})`);

      res.status(200).json({
        message: isNewUser ? "Welcome to the Arena!" : "Welcome back!",
        user,
        token,
        refreshToken,
        isNewUser // 💡 Frontend uses this to navigate to Username Pick screen
      });

    } catch (error) {
      console.error("❌ GOOGLE SYNC ERROR:", error.message);
      res.status(500).json({ error: "Identity synchronization failed." });
    }
  },

  /**
   * STAGE 2: The Fighter Signup
   * Used for manual registration.
   */
  async register(req, res) {
    try {
      if (!req.body || Object.keys(req.body).length === 0) {
        return res.status(400).json({ error: "Form data is missing." });
      }

      console.log("🚀 REGISTER ATTEMPT:", req.body.email);

      const userData = {
        username: req.body.displayName || req.body.username,
        email: req.body.email,
        password: req.body.uid || req.body.password,
        profilePic: req.body.photoURL
      };

      const newUser = await authService.registerUser(userData);

      // Generate tokens
      const token = jwt.sign(
        { id: newUser.id },
        process.env.ACCESS_TOKEN_SECRET || "your_fallback_secret",
        { expiresIn: "1h" }
      );

      const refreshToken = jwt.sign(
        { id: newUser.id },
        process.env.REFRESH_TOKEN_SECRET || "your_fallback_refresh_secret"
      );

      // 🛡️ STAFF FIX: Persist token to DB
      await User.update(
        { refreshToken: refreshToken },
        { where: { id: newUser.id } }
      );

      console.log("✅ REGISTER SUCCESS:", newUser.username);
      res.status(201).json({
        message: "Welcome to the Arena!",
        user: newUser,
        token,
        refreshToken
      });
    } catch (error) {
      console.error("❌ REGISTER ERROR:", error.message);
      if (error.message === "Username or email already exists") {
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: "Could not enter the arena." });
    }
  },

  /**
   * STAGE 3: The Returning Fighter
   */
  async login(req, res) {
    console.log("🚀 LOGIN ATTEMPT:", req.body.email);
    try {
      const { email, password } = req.body;
      const result = await authService.loginUser(email, password);

      if (result && result.token) {
        // 🛡️ STAFF FIX: Save the refresh token upon successful login
        await User.update(
          { refreshToken: result.refreshToken },
          { where: { id: result.user.id } }
        );

        console.log("✅ LOGIN SUCCESS:", email);
        res.status(200).json({
          message: "Login successful",
          token: result.token,
          user: result.user,
          refreshToken: result.refreshToken
        });
      } else {
        res.status(401).json({ error: "Invalid credentials" });
      }
    } catch (error) {
      console.error("❌ LOGIN ERROR:", error);
      res.status(500).json({ error: "Failed to login" });
    }
  },

  /**
   * STAGE 4: Token Refreshing
   * 🛡️ NEW: This allows the app to get a new token without logging out
   */
  async refresh(req, res) {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) return res.status(401).json({ error: "No refresh token" });

      // Verify if token exists in DB
      const user = await User.findOne({ where: { refreshToken } });
      if (!user) return res.status(403).json({ error: "Invalid refresh token" });

      // Verify the JWT itself
      jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET || "your_fallback_refresh_secret", (err, decoded) => {
        if (err) return res.status(403).json({ error: "Token expired" });

        const newAccessToken = jwt.sign(
          { id: user.id },
          process.env.ACCESS_TOKEN_SECRET || "your_fallback_secret",
          { expiresIn: "1h" }
        );

        res.json({ accessToken: newAccessToken });
      });
    } catch (error) {
      res.status(500).json({ error: "Refresh failed" });
    }
  },

  /**
   * STAGE 5: Arena Exit
   */
  async logout(req, res) {
    try {
      // 🛡️ Clear token from DB so the user is truly logged out
      if (req.user) {
        await User.update({ refreshToken: null }, { where: { id: req.user.id } });
      }
      res.status(200).json({ message: "Logged out successfully" });
    } catch (error) {
      res.status(200).json({ message: "Logged out locally" });
    }
  },

  /**
   * STAGE 6: Identity Check
   */
  async getMe(req, res) {
    try {
      res.status(200).json(req.user);
    } catch (error) {
      console.error("Error fetching current user:", error);
      res.status(500).json({ error: "Failed to fetch user data" });
    }
  },
};

module.exports = authController;