const express = require("express");
const userController = require("./user.controller");
const multer = require('multer');

// Use memoryStorage if you are doing the same for stories, 
// OR use diskStorage if you want them saved in an /uploads folder.
const storage = multer.diskStorage({
    destination: 'uploads/',
    filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});

const upload = multer({ storage: storage });
const router = express.Router();

router.get("/", userController.getAllUsers);
router.get("/:id", userController.getUserById);

// 🛡️ FIX: This now matches your story route style.
// It uses upload.single to parse the 'profilePic' and populate req.body
router.post("/", upload.single('profilePic'), userController.createUser);

router.put("/:id", upload.single('profilePic'), userController.updateUser);
router.delete("/:id", userController.deleteUser);

module.exports = router;