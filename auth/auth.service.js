// auth/auth.service.js
const { Sequelize } = require("sequelize"); // Import the Sequelize constructor

const User = require("../user/user.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const authService = {
  async registerUser({ username, email, password }) {
    try {
      // Check if user with the same username or email already exists
      const existingUser = await User.findOne({
        where: {
          [Sequelize.Op.or]: [{ username }, { email }],
        },
      });
      if (existingUser) {
        throw new Error("Username or email already exists");
      }
      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = await User.create({
        username,
        email,
        password: hashedPassword,
      });
      return newUser; // Sequelize's create method returns the created instance
    } catch (error) {
      console.error("Error in authService.registerUser:", error);
      throw error;
    }
  },
  async loginUser(email, password) {
    console.log("🚀 Attempting login for:", email);
    try {
      // 1. Find user and EXPLICITLY include the password field
      // By default, your model likely excludes it for security, 
      // but we need it here for the comparison.
      const user = await User.findOne({
        where: { email },
        attributes: ['id', 'username', 'email', 'password']
      });

      // 2. If user doesn't exist, return null
      if (!user) {
        console.log("❌ Login failed: User not found");
        return null;
      }

      // 3. Compare the provided plain-text password with the stored hash
      // user.password is now available because of the 'attributes' block above
      const passwordMatch = await bcrypt.compare(password, user.password);

      if (!passwordMatch) {
        console.log("❌ Login failed: Password mismatch");
        return null;
      }

      console.log("✅ Login successful for:", user.username);

      // 4. Generate JWT Tokens
      const token = jwt.sign(
        { id: user.id },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "1h" }
      );

      const refreshToken = jwt.sign(
        { id: user.id },
        process.env.REFRESH_TOKEN_SECRET
      );

      // Return user (without the hash for the frontend) and tokens
      const userResponse = user.toJSON();
      delete userResponse.password;

      return { user: userResponse, token, refreshToken };

    } catch (error) {
      console.error("Error in authService.loginUser:", error);
      throw error;
    }
  }

  // Potentially other auth-related service methods (e.g., password reset logic)
};

module.exports = authService;
