const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();

// Enable CORS for all requests
app.use(cors());

// Proxy endpoint to fetch the video and send raw video data
app.get("/proxy/video", async (req, res) => {
    try {
        const videoUrl = "https://1roos.com/videos/video-3.mp4";

        // Fetch the video using Axios (as arraybuffer to handle binary data)
        const response = await axios.get(videoUrl, {
            responseType: 'arraybuffer' // Fetch as raw binary data
        });

        if (response.status === 200) {
            // Set headers to indicate content type and length
            res.set('Content-Type', 'video/mp4');
            res.set('Content-Length', response.data.length);

            // Stream the video data to the client
            res.send(response.data);
        } else {
            res.status(response.status).send(`Failed to fetch video: ${response.statusText}`);
        }
    } catch (error) {
        console.error("Error in /proxy/video route:", error);
        res.status(500).send("Server error occurred while fetching the video.");
    }
});

// Start the server
const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
