"use strict";
// auth/auth.controller.js
const authService = require("./auth.service");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../user/user.model"); // Assuming you have a User model
const authController = {
  async register(req, res) {
    console.log("REQU BODY IS HERE", req.body);
    try {
      const { username, email, password } = req.body;
      const newUser = await authService.registerUser({
        username,
        email,
        password,
      });
      res
        .status(201)
        .json({ message: "User registered successfully", user: newUser });
    } catch (error) {
      console.error("Error registering user:", error);
      if (error.message === "Username or email already exists") {
        return res.status(409).json({ error: error.message });
      }
      res.status(500).json({ error: "Failed to register user" });
    }
  },
  async login(req, res) {
    console.log('loggin in ghost')
    try {
      const { email, password } = req.body;
      const { token, user, refreshToken } = await authService.loginUser(
        email,
        password
      );
      console.log("HERE MY USER DATA,", email, user);
      if (token && user) {
        res
          .status(200)
          .json({ message: "Login successful", token, user, refreshToken });
      } else {
        res.status(401).json({ error: "Invalid credentials" });
      }
    } catch (error) {
      console.error("Error logging in:", error);
      res.status(500).json({ error: "Failed to login" });
    }
  },
  async logout(req, res) {
    // Implement logout logic if needed (e.g., invalidating JWT on the client-side)
    res.status(200).json({ message: "Logged out successfully" });
  },
  async getMe(req, res) {
    // Assuming your authMiddleware attaches the authenticated user to the request (req.user)
    try {
      res.status(200).json(req.user);
    } catch (error) {
      console.error("Error fetching current user:", error);
      res.status(500).json({ error: "Failed to fetch user data" });
    }
  },
};
module.exports = authController;
