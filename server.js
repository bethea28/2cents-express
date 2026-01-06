"use strict";
const express = require("express");
const path = require("path");
const fs = require("fs");
const app = express();
const port = 3000;

const authRoutes = require("./auth/auth.routes");
const storyRoutes = require("./story/story.routes");
const voteRoutes = require("./vote/vote.routes");
const commentRoutes = require("./comment/comment.routes");
const likeRoutes = require("./like/like.routes");

// --- 1. BOOTSTRAP: Ensure upload folder exists ---
const uploadDir = path.join(__dirname, "uploads/videos");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log("📁 Created uploads/videos directory");
}

// --- 2. MIDDLEWARE ---
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve the 'uploads' folder so videos are accessible via URL
// Example: http://localhost:3000/uploads/videos/your-video.mp4
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use((req, res, next) => {
  const authHeader = req.headers.authorization;
  console.log("🔑 Auth Header:", authHeader);
  next();
});

// --- 3. ROUTES ---
app.get("/", (req, res) => {
  res.send("Hello World! bryan");
});

app.use("/auth", authRoutes);
app.use("/stories", storyRoutes);
app.use("/votes", voteRoutes);
app.use("/comments", commentRoutes);
app.use("/likes", likeRoutes);

// app.listen(port, () => {
//   console.log(`🚀 Server running at http://localhost:${port}`);
// });
const sequelize = require("./config/database"); // Your database.js file
require("./user/user.model");
require("./story/story.model");

sequelize.sync({ alter: true })
  // sequelize.sync({ force: true })
  .then(() => console.log("🚀 Postgres tables are synced and ready!"))
  .catch(err => console.log("❌ Sync error:", err));

app.listen(port, '0.0.0.0', () => { //listen to any connection on my network
  console.log(`🚀 Server running at http://172.20.10.4:${port}`);
});

// "use strict";
// const express = require("express");
// const app = express();
// const port = 3000;
// const authRoutes = require("./auth/auth.routes");
// const storyRoutes = require("./story/story.routes");
// app.use(express.json()); // Add this line
// app.use(express.urlencoded({ extended: true })); // For parsing application/x-www-form-urlencoded
// app.use((req, res, next) => {
//   const authHeader = req.headers.authorization;
//   console.log("Authorization Header", authHeader);
//   next();
// });

// app.get("/", (req, res) => {
//   res.send("Hello World! bryan");
// });
// app.use("/auth", authRoutes);
// app.use("/stories", storyRoutes);
// app.listen(port, () => {
//   console.log(`Example app listening on port ${port}`);
// });
