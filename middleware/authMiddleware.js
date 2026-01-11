"use strict";

const jwt = require("jsonwebtoken");
const User = require("../user/user.model");

/**
 * 🛡️ STAFF ENGINEER: THE GATEKEEPER
 * This ensures only fighters with a valid "Arena Pass" (JWT) can enter.
 */
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];

    // 1. Extract the token from "Bearer <token>"
    let token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      console.log("🔒 Access Denied: No token found in headers.");
      return res.status(401).json({ error: "Unauthorized: No token provided." });
    }

    // ⚡️ CLEANING: Remove extra quotes that sometimes sneak in from mobile storage or Postman
    token = token.replace(/"/g, '');

    // 2. Verification Phase
    // 🛡️ CRITICAL: Must match the secret used in auth.controller.js exactly!
    const secret = process.env.ACCESS_TOKEN_SECRET || "your_fallback_secret";

    const decoded = jwt.verify(token, secret);

    // 3. Database Check: Ensure the user still exists in Postgres
    const user = await User.findByPk(decoded.id);

    if (!user) {
      console.log(`❌ Token valid, but User ID ${decoded.id} no longer exists.`);
      return res.status(401).json({ error: "Unauthorized: User not found." });
    }

    // 4. Success: Attach the live Sequelize instance to the request
    // This allows routes like /logout to call user.update()
    req.user = user;
    next();

  } catch (err) {
    console.error("⚠️ JWT Verification Failed:", err.message);

    // If the token is expired, send a 403 so the frontend knows to try the /refresh route
    return res.status(403).json({
      error: "Forbidden: Token expired or invalid.",
      details: err.message
    });
  }
};

module.exports = { authMiddleware: authenticateToken };