import express from "express";
import axios from "axios";
import querystring from "querystring";
import dotenv from "dotenv";
import {
  getTopArtists,
  getTopTracks,
  getRecentlyPlayed,
} from "./spotifyService.js";

dotenv.config();

const router = express.Router();

router.get("/login", (req, res) => {
  const scope = [
    "user-read-private",
    "user-read-email",
    "user-top-read",
    "user-read-recently-played",
    "user-read-playback-state",
    "user-read-currently-playing",
  ].join(" ");

  const params = querystring.stringify({
    response_type: "code",
    client_id: process.env.SPOTIFY_CLIENT_ID,
    scope,
    redirect_uri: process.env.SPOTIFY_REDIRECT_URI,
  });

  res.redirect("https://accounts.spotify.com/authorize?" + params);
});

// backend: routes.js
router.get("/callback", async (req, res) => {
  const code = req.query.code;

  try {
    const tokenRes = await axios.post(
      "https://accounts.spotify.com/api/token",
      querystring.stringify({
        grant_type: "authorization_code",
        code,
        redirect_uri: process.env.SPOTIFY_REDIRECT_URI,
        client_id: process.env.SPOTIFY_CLIENT_ID,
        client_secret: process.env.SPOTIFY_CLIENT_SECRET,
      }),
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );

    const { access_token, refresh_token } = tokenRes.data;

    // Aquí redirigimos a React con los tokens
    res.redirect(
      `${process.env.FRONTEND_URI}/logged?access_token=${access_token}&refresh_token=${refresh_token}`
    );
  } catch (err) {
    console.error(err);
    res.status(500).send("Error getting tokens");
  }
});

router.get("/top-artists", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  const timeRange = req.query.time_range || "medium_term";
  if (!token) return res.status(401).json({ error: "Missing token" });

  try {
    const data = await getTopArtists(token, timeRange);
    res.json(data);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

router.get("/top-tracks", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  const timeRange = req.query.time_range || "medium_term";

  if (!token) return res.status(401).json({ error: "Missing token" });

  try {
    const data = await getTopTracks(token, timeRange);
    res.json(data);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

router.get("/recently-played", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Missing token" });

  try {
    const data = await getRecentlyPlayed(token);
    res.json(data);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
