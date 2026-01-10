// auth/auth.service.js
const { Sequelize } = require("sequelize");
const User = require("../user/user.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const authService = {

  // Added profilePic here so it actually saves to the DB!
  async registerUser({ username, email, password, profilePic }) {
    try {
      const existingUser = await User.findOne({
        where: { [Sequelize.Op.or]: [{ username }, { email }] },
      });

      if (existingUser) {
        throw new Error("Username or email already exists");
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const newUser = await User.create({
        username,
        email,
        password: hashedPassword,
        profilePic, // Now saving the path from Multer
      });

      return newUser;
    } catch (error) {
      console.error("Error in authService.registerUser:", error);
      throw error;
    }
  },

  async loginUser(email, password) {
    try {
      console.log("🔍 Service: Searching for fighter with email:", email);

      // 1. Find the user by EMAIL ONLY
      // We explicitly include 'password' because models usually exclude it by default
      const user = await User.findOne({
        where: { email: email.toLowerCase().trim() },
        attributes: ["id", "username", "email", "password", "profilePic"],
      });

      // 2. If no user is found, don't crash—return a clear failure
      if (!user) {
        console.log("❌ Service: No fighter found with that email.");
        return null;
      }

      // 3. Compare the "Secret Key" (Password)
      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        console.log("❌ Service: Secret Key (password) does not match.");
        return null;
      }

      // 4. Generate the "Arena Pass" (Tokens)
      // We use the ID because it's the primary key that never changes
      const token = jwt.sign(
        { id: user.id },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "1h" }
      );

      const refreshToken = jwt.sign(
        { id: user.id },
        process.env.REFRESH_TOKEN_SECRET
      );

      // 5. Clean the user object before sending it to the frontend
      // We never send the hashed password back to the phone
      const userResponse = user.toJSON();
      delete userResponse.password;

      console.log("✅ Service: Login successful for", userResponse.username);

      return {
        user: userResponse,
        token,
        refreshToken
      };

    } catch (error) {
      console.error("❌ Service: Fatal error during login:", error.message);
      throw error;
    }
  },
};

module.exports = authService;