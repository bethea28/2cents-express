// push.controller.js
const pushService = require("./push.service");

const pushController = {
  /**
   * 🥩 REGISTER TOKEN (Saving the S8 address)
   */
  async registerToken(req, res) {
    try {
      const { userId, token } = req.body;

      if (!userId || !token) {
        return res.status(400).json({ error: "User ID and Token are required." });
      }

      // 1. Call the service to handle the database logic
      const updatedUser = await pushService.updateUserNotificationToken(userId, token);

      if (!updatedUser) {
        return res.status(404).json({ error: "Fighter not found." });
      }

      // 2. Return success
      return res.status(200).json({
        success: true,
        message: "Push token registered successfully!",
      });
    } catch (error) {
      console.error("Push Registration Controller Error:", error);
      return res.status(500).json({ error: error.message || "Internal Server Error" });
    }
  },

  /**
   * 🥩 SEND TEST PUSH (Triggering the Beef)
   */
  async sendTestPush(req, res) {
    try {
      const { userId } = req.body;
      console.log('DECK', userId);

      if (!userId) {
        return res.status(400).json({ error: "User ID is required to send a test push." });
      }

      // 1. Call the service
      const result = await pushService.sendTestNotification(userId);

      // 🛡️ STAFF FIX: Check if result itself is null or undefined first
      if (!result || result.error) {
        return res.status(404).json({
          error: result?.error || "Notification service failed to return a result."
        });
      }

      // 2. Return success
      // Note: We use result.username if your service returns it, 
      // otherwise we just send a generic success.
      return res.status(200).json({
        success: true,
        message: `Beef successfully sent!`,
        data: result // This will contain your Expo ticket
      });
    } catch (error) {
      console.error("Push Test Controller Error:", error);
      return res.status(500).json({ error: error.message || "Internal Server Error" });
    }
  }
};

module.exports = pushController;