const bucket = require("./firebase.config");
const { Story } = require("./models"); // Your Sequelize Story model

exports.createCallOut = async (req, res) => {
    try {
        const file = req.file; // Provided by Multer memoryStorage
        if (!file) return res.status(400).send("No video uploaded.");

        // 1. Create a unique filename in the 'videos' folder
        const fileName = `videos/${Date.now()}_${file.originalname}`;
        const fileUpload = bucket.file(fileName);

        // 2. Stream the file to Firebase
        const blobStream = fileUpload.createWriteStream({
            metadata: { contentType: file.mimetype }
        });

        blobStream.on("error", (error) => res.status(500).json({ error }));

        blobStream.on("finish", async () => {
            // 3. Construct the public URL
            const publicUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(fileName)}?alt=media`;

            // 4. Save everything to your Postgres Story table
            const newStory = await Story.create({
                sideAVideoUrl: publicUrl,
                sideAAuthorId: req.user.id, // From your auth middleware
                wager: req.body.wager,
                title: req.body.title,
                status: "pending-response",
                storyType: "call-out"
            });

            res.status(201).json(newStory);
        });

        blobStream.end(file.buffer);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};