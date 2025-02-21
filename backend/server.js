const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
require("dotenv").config();
const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const app = express();

app.use(cors({
    origin: "https://social-display.vercel.app",
    credentials: true
}));

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const CLIENT_KEY = process.env.CLIENT_KEY;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;

app.get("/oauth", (req, res) => {
    const csrfState = Math.random().toString(36).substring(2);
    res.cookie("csrfState", csrfState, { maxAge: 60000, httpOnly: true, secure: true, sameSite: 'none' });

    const url = `https://www.tiktok.com/v2/auth/authorize/?client_key=${CLIENT_KEY}&scope=user.info.basic&response_type=code&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&state=${csrfState}`;

    res.redirect(url);
});

app.get("/auth/callback", async (req, res) => {
    const { code, state, error } = req.query;

    if (error) return res.status(400).json({ error });

    const storedState = req.cookies.csrfState;
    if (!state || state !== storedState) {
        return res.status(403).json({ error: "CSRF validation failed" });
    }

    try {
        const tokenResponse = await fetch("https://open-api.tiktok.com/oauth/access_token/", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({
                client_key: CLIENT_KEY,
                client_secret: CLIENT_SECRET,
                code,
                grant_type: "authorization_code",
                redirect_uri: REDIRECT_URI,
            }),
        });

        const tokenData = await tokenResponse.json();

        if (!tokenResponse.ok) {
            return res.status(tokenResponse.status).json({ error: tokenData });
        }

        res.json(tokenData);
    } catch (error) {
        res.status(500).json({ error: "Failed to get access token", details: error.message });
    }
});

app.listen(5000, () => console.log("Server running on port 5000"));
