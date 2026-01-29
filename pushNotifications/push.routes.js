const express = require("express");
const router = express.Router();
const pushController = require("./push.controller");
const { authMiddleware } = require("../middleware/authMiddleware");

// PROTECT: Ensure we know which user is registering their S8
router.post("/register", authMiddleware, pushController.registerToken);

// PROTECT: Only a logged-in user can trigger a test
router.post("/send-test", authMiddleware, pushController.sendTestPush);

module.exports = router;