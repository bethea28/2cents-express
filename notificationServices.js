const { Expo } = require('expo-server-sdk');
let expo = new Expo();

const sendBeefNotification = async (targetToken, challengeTitle) => {
    // 1. Validate the token first so you don't waste time
    if (!Expo.isExpoPushToken(targetToken)) {
        console.error(`❌ Push token ${targetToken} is not a valid Expo push token`);
        return;
    }

    let messages = [{
        to: targetToken,
        sound: 'default',
        title: '🥊 New Beef Challenge!',
        body: `You've been called out for: ${challengeTitle}`,
        data: { screen: 'Challenges' },
    }];

    // 🛡️ The "Staff" Secret: Chunking
    // This splits long lists into small batches Expo can handle
    let chunks = expo.chunkPushNotifications(messages);

    for (let chunk of chunks) {
        try {
            let ticketChunk = await expo.sendPushNotificationsAsync(chunk);
            console.log("✅ Notification sent successfully:", ticketChunk);
            // NOTE: In the future, you can save 'ticketChunk' IDs to check if 
            // the delivery actually reached the S8 later on.
        } catch (error) {
            console.error("❌ Notification failed to send:", error);
        }
    }
};

module.exports = { sendBeefNotification };