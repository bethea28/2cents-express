const User = require("../user/user.model");
const { sendBeefNotification } = require("../notificationServices");

class PushService {
  /**
   * 🥩 Save token to the specific user
   * Verified: This is working perfectly with your S8 sync!
   */
  async updateUserNotificationToken(userId, token) {
    try {
      const user = await User.findByPk(userId);
      if (!user) return null;

      user.pushToken = token;
      await user.save();
      return user;
    } catch (error) {
      console.error(`Error in pushService.updateToken for User ${userId}:`, error);
      throw error;
    }
  }

  /**
   * 🥩 DYNAMIC NOTIFICATION ENGINE
   * Use this for Votes, Comments, and Challenges
   */
  async sendBeefNotificationToUser(userId, message, data = {}) {
    try {
      const user = await User.findByPk(userId);
      if (!user) {
        return { error: "User not found" };
      }
      if (!user.pushToken) {
        console.log(`⚠️ Skip: No token for User ${userId}`);
        return { error: "No push token registered for this user" };
      }

      // 🥩 Await the utility call
      const ticket = await sendBeefNotification(user.pushToken, message, data);

      console.log(`🚀 Notification sent to ${user.username}: ${message}`);

      // 🥩 ALWAYS return an object with the data the controller expects
      return {
        success: true,
        username: user.username,
        ticket: ticket
      };

    } catch (error) {
      console.error(`Error sending notification to User ${userId}:`, error);
      return { error: error.message || "Internal Service Error" };
    }
  }

  /**
   * 🥩 TEST LOGIC
   * Keeping this for your manual "send-test" route
   */
  async sendTestNotification(userId) {
    return this.sendBeefNotificationToUser(userId, "Backend sync complete! 🥩");
  }
}

module.exports = new PushService();