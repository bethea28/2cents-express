const admin = require("firebase-admin");
// This is the JSON file you downloaded from Project Settings -> Service Accounts
const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: "cents-fe1c4.firebasestorage.app" // Your bucket address
});

const bucket = admin.storage().bucket();
module.exports = bucket;