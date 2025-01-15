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
    const { code } = req.body;

    try {
        const response = await axios.post('https://graph.facebook.com/v17.0/oauth/access_token', {
            client_id: process.env.CLIENT_ID,
            client_secret: process.env.CLIENT_SECRET,
            redirect_uri: process.env.REDIRECT_URI,
            code,
        });

        const data = response.data;

        if (data.access_token) {
            res.status(200).json({ access_token: data.access_token });
        } else {
            res.status(400).json({ error: 'Failed to fetch access token', details: data });
        }
    } catch (error) {
        res.status(500).json({ error: 'Server error', details: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
