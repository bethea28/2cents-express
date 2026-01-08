"use strict";
// auth/auth.routes.js
const express = require("express");
const router = express.Router();
const authController = require("./auth.controller");
const multer = require('multer');

// Configure Multer for your User Icons
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/"); // Ensure this folder exists!
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    },
});

const upload = multer({ storage: storage });

// 🛡️ THE FIX: Add upload.single('profilePic') here
// This middleware is what turns the stream into req.body.username, etc.
router.post("/register", upload.single('profilePic'), authController.register);

// Login usually stays JSON/UrlEncoded, so it doesn't need Multer
router.post("/login", authController.login);

router.post("/logout", authController.logout);

module.exports = router;