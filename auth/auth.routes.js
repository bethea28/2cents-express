"use strict";
// auth/auth.routes.js
const express = require("express");
const router = express.Router();
const authController = require("./auth.controller");
const multer = require('multer');

// Configure Multer for your User Icons
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/");
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    },
});

const upload = multer({ storage: storage });

// Existing Routes (Untouched)
router.post("/register", upload.single('profilePic'), authController.register);
router.post("/login", authController.login);
router.post("/logout", authController.logout);

// 🛡️ NEW: Google Identity Sync
// Note: No multer here! Google sends JSON, not multipart files.
router.post("/google-sync", authController.googleSync);

module.exports = router;