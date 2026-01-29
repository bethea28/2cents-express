const userService = require("./user.service");

class UserController {
  async getAllUsers(req, res) {
    try {
      const users = await userService.getAllUsers();
      res.status(200).json(users);
    } catch (error) {
      console.error("Error fetching all users:", error);
      res.status(500).json({ error: "Failed to fetch users" });
    }
  }

  async getUserById(req, res) {
    try {
      const userId = parseInt(req.params.id, 10);
      const user = await userService.getUserById(userId);
      if (user) {
        res.status(200).json(user);
      } else {
        res.status(404).json({ message: "User not found" });
      }
    } catch (error) {
      console.error(`Error fetching user with ID ${req.params.id}:`, error);
      res.status(500).json({ error: "Failed to fetch user" });
    }
  }

  async createUser(req, res) {
    try {
      // 🛠️ Staff Engineer Tip: Merge the file path into the body for the service
      const userData = {
        ...req.body,
        // If a file was uploaded, use its path; otherwise, the model default kicks in
        profilePic: req.file ? `/uploads/${req.file.filename}` : undefined
      };

      const newUser = await userService.createUser(userData);

      // 🛡️ Security: Your model's defaultScope already excludes the password, 
      // but the service refactor we did ensures it's extra safe.
      res.status(201).json({
        message: "Fighter registered successfully!",
        user: newUser
      });
    } catch (error) {
      console.error("Error creating user:", error);

      // 🛡️ Error Handling: Catch unique constraint errors (e.g., Email/Username taken)
      if (error.name === 'SequelizeUniqueConstraintError') {
        return res.status(400).json({ error: "Username or Email already in use." });
      }

      res.status(500).json({ error: "Failed to enter the arena. Please try again." });
    }
  }

  async updateUser(req, res) {
    try {
      const userId = parseInt(req.params.id, 10);
      const [updatedCount, updatedUsers] = await userService.updateUser(
        userId,
        req.body
      );
      if (updatedCount > 0) {
        res.status(200).json(updatedUsers[0]);
      } else {
        res.status(404).json({ message: "User not found" });
      }
    } catch (error) {
      console.error(`Error updating user with ID ${req.params.id}:`, error);
      res.status(500).json({ error: "Failed to update user" });
    }
  }

  async deleteUser(req, res) {
    try {
      const userId = parseInt(req.params.id, 10);
      const deletedRows = await userService.deleteUser(userId);
      if (deletedRows > 0) {
        res.status(204).send();
      } else {
        res.status(404).json({ message: "User not found" });
      }
    } catch (error) {
      console.error(`Error deleting user with ID ${req.params.id}:`, error);
      res.status(500).json({ error: "Failed to delete user" });
    }
  }
}

module.exports = new UserController();
