const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = 5000;

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Route to handle access token exchange
app.post('/exchange-token', async (req, res) => {
    console.log("Received request at /exchange-token"); // Log when the route is hit

    const { code } = req.body;

    console.log("Code received from client:", code); // Log the code received

    // Log environment variables (Make sure not to log sensitive data in production)
    console.log("Payload==>", {
        client_id: process.env.CLIENT_ID,
        client_secret: process.env.CLIENT_SECRET,
        redirect_uri: process.env.REDIRECT_URI
    });

    try {
        console.log("Attempting to fetch access token from Facebook...");

        const response = await axios.post('https://graph.facebook.com/v17.0/oauth/access_token', {
            client_id: process.env.CLIENT_ID,
            client_secret: process.env.CLIENT_SECRET,
            redirect_uri: process.env.REDIRECT_URI,
            code,
        });

        const data = response.data;

        console.log("Response from Facebook:", data); // Log the response from Facebook

        if (data.access_token) {
            console.log("Access token fetched successfully:", data.access_token); // Log success
            res.status(200).json({ access_token: data.access_token });
        } else {
            console.log("Failed to fetch access token:", data); // Log failure
            res.status(400).json({ error: 'Failed to fetch access token', details: data });
        }
    } catch (error) {
        console.error("Error occurred while fetching access token:", error.message); // Log error details
        res.status(500).json({ error: 'Server error', details: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
