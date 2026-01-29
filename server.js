"use strict";
const express = require("express");
const path = require("path");
const fs = require("fs");
const cors = require("cors"); // 🛡️ Staff Engineer: Added for mobile connection
const app = express();
const port = 5001;

// --- 1. BOOTSTRAP: Ensure upload folder exists ---
const uploadDir = path.join(__dirname, "uploads/videos");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log("📁 Created uploads/videos directory");
}

// --- 2. MIDDLEWARE ---
app.use(cors()); // 🛡️ CRITICAL: Allows your phone to talk to this laptop
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 🛡️ Log incoming requests BEFORE they hit routes so you can debug the login
app.use((req, res, next) => {
  console.log(`📡 [${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
  // 🛡️ Added a check to ensure req.body exists before looking for keys
  if (req.body && Object.keys(req.body).length > 0) {
    console.log(`📦 Body:`, req.body);
  }
  next();
});
// Serve the 'uploads' folder so videos are accessible via URL
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// --- 3. ROUTES ---
const authRoutes = require("./auth/auth.routes");
const storyRoutes = require("./story/story.routes");
const voteRoutes = require("./vote/vote.routes");
const commentRoutes = require("./comment/comment.routes");
const likeRoutes = require("./likes/like.routes");
const pushRoutes = require("./pushNotifications/push.routes");

const { sendBeefNotification } = require('./notificationServices');
// (Make sure the path matches where you saved the function)
app.get("/", (req, res) => {
  res.send("Arena Server is Live! 🚀");
});

app.use("/auth", authRoutes);
app.use("/stories", storyRoutes);
app.use("/votes", voteRoutes);
app.use("/comments", commentRoutes);
app.use("/likes", likeRoutes);
app.use("/pushNotifications", pushRoutes)
// Add this to your backend server file
app.post('/test-beef', async (req, res) => {
  const s8Token = "ExponentPushToken[L7ogYlAw7mw1xvJosiUo9M]";

  console.log("🚀 Attempting to send Beef to S8...");

  try {
    await sendBeefNotification(s8Token, "Test Beef from Terminal!");
    res.status(200).send("✅ Check your S8! Notification sent.");
  } catch (err) {
    res.status(500).send("❌ It failed: " + err.message);
  }
});

// --- 4. DATABASE & STARTUP ---
const sequelize = require("./config/database");
require("./user/user.model");
require("./story/story.model");

sequelize.sync({ alter: true })
  // sequelize.sync({ force: true })
  .then(() => console.log("🚀 Postgres tables are synced and ready!"))
  .catch(err => console.log("❌ Sync error:", err));

app.listen(port, '0.0.0.0', () => {
  console.log(`
  🥊 ARENA SERVER LIVE
  ---------------------------------
  Local:   http://localhost:${port}
  Network: http://172.20.10.4:${port}
  ---------------------------------
  `);
});