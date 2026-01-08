"use strict";

const authService = require("./auth.service");
const jwt = require("jsonwebtoken");

const authController = {
  /**
   * STAGE 1: The Fighter Signup
   * Handles multipart/form-data from Multer
   */

  async register(req, res) {
    try {
      // 🛡️ Safety Check: If Multer fails to parse the body
      if (!req.body || Object.keys(req.body).length === 0) {
        return res.status(400).json({ error: "Form data is missing. Check your 'uploads' folder." });
      }

      console.log("🚀 REGISTER ATTEMPT:", req.body.username);

      const userData = {
        username: req.body.username,
        email: req.body.email,
        password: req.body.password,
        profilePic: req.file ? `/uploads/${req.file.filename}` : undefined
      };

      const newUser = await authService.registerUser(userData);



      // 3. 🛡️ Auto-Login: Generate tokens immediately for a seamless entry
      // Use the same secrets as your login logic
      const token = jwt.sign(
        { id: newUser.id },
        process.env.ACCESS_TOKEN_SECRET || "your_fallback_secret",
        { expiresIn: "1h" }
      );

      const refreshToken = jwt.sign(
        { id: newUser.id },
        process.env.REFRESH_TOKEN_SECRET || "your_fallback_refresh_secret"
      );

      // 4. Respond with the payload the React Native app expects
      console.log("✅ REGISTER SUCCESS:", newUser.username);
      res.status(201).json({
        message: "Welcome to the Arena!",
        user: newUser,
        token,
        refreshToken
      });
    } catch (error) {
      console.error("❌ REGISTER ERROR:", error.message);

      // Handle specific "User Exists" error from service
      if (error.message === "Username or email already exists") {
        return res.status(400).json({ error: error.message });
      }

      res.status(500).json({ error: "Could not enter the arena." });
    }
  },

  /**
   * STAGE 2: The Returning Fighter
   */
  async login(req, res) {
    console.log("🚀 LOGIN ATTEMPT:", req.body.email);
    try {
      const { email, password } = req.body;

      const result = await authService.loginUser(email, password);

      if (result && result.token) {
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
   * STAGE 3: Arena Exit
   */
  async logout(req, res) {
    res.status(200).json({ message: "Logged out successfully" });
  },

  /**
   * STAGE 4: Identity Check
   */
  async getMe(req, res) {
    try {
      // req.user is populated by your authMiddleware
      res.status(200).json(req.user);
    } catch (error) {
      console.error("Error fetching current user:", error);
      res.status(500).json({ error: "Failed to fetch user data" });
    }
  },
};

module.exports = authController;