const User = require("./user.model");
const bcrypt = require('bcrypt');

class UserService {
  async getAllUsers() {
    try {
      return await User.findAll();
    } catch (error) {
      console.error("Error in userService.getAllUsers:", error);
      throw error;
    }
  }

  async getUserById(id) {
    try {
      return await User.findByPk(id);
    } catch (error) {
      console.error(`Error in userService.getUserById for ID ${id}:`, error);
      throw error;
    }
  }


  async createUser(userData) {
    try {
      // 🛡️ Security: Hash the password before it touches the DB
      if (userData.password) {
        const salt = await bcrypt.genSalt(10);
        userData.password = await bcrypt.hash(userData.password, salt);
      }

      // 🛡️ Integrity: Ensure fields like status/role are set correctly if not provided
      // (Sequelize defaults will handle this, but explicit is better for logic)

      const newUser = await User.create(userData);

      // 🛡️ Security: Return the user but ensure the password isn't in the object
      const userJson = newUser.toJSON();
      delete userJson.password;

      return userJson;
    } catch (error) {
      console.error("Error in userService.createUser:", error);
      throw error;
    }
  }

  async updateUser(id, userData) {
    try {
      return await User.update(userData, {
        where: { id },
      });
    } catch (error) {
      console.error(`Error in userService.updateUser for ID ${id}:`, error);
      throw error;
    }
  }

  async deleteUser(id) {
    try {
      return await User.destroy({
        where: { id },
      });
    } catch (error) {
      console.error(`Error in userService.deleteUser for ID ${id}:`, error);
      throw error;
    }
  }
}

module.exports = new UserService();
