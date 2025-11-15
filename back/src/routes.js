import express from "express";
import axios from "axios";
import querystring from "querystring";
import dotenv from "dotenv";
import cookieParser from "cookie-parser"; // para manejar cookies
import {
  getTopArtists,
  getTopTracks,
  getRecentlyPlayed,
} from "./spotifyService.js";

dotenv.config();

const router = express.Router();
router.use(cookieParser()); // inicializar cookie parser

// Login: redirige a Spotify para autorización
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

// Callback: intercambia el code por tokens y los guarda en cookie
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

    const { access_token, refresh_token, expires_in } = tokenRes.data;

    // Guardar tokens en cookies HTTPOnly
    res.cookie("spotify_access_token", access_token, {
      httpOnly: true,
      secure: true, // usar true en producción con HTTPS
      maxAge: expires_in * 1000, // expiración en ms
      sameSite: "lax",
    });

    res.cookie("spotify_refresh_token", refresh_token, {
      httpOnly: true,
      secure: true,
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 días
      sameSite: "lax",
    });

    // Redirigir al frontend sin exponer tokens
    res.redirect(`${process.env.FRONTEND_URI}/logged`);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error getting tokens");
  }
});

// Middlewares para proteger rutas con token de la cookie
const requireSpotifyToken = (req, res, next) => {
  const token = req.cookies.spotify_access_token;
  if (!token) return res.status(401).json({ error: "Missing token" });
  req.spotifyToken = token;
  next();
};

// Endpoints protegidos
router.get("/top-artists", requireSpotifyToken, async (req, res) => {
  const timeRange = req.query.time_range || "medium_term";
  try {
    const data = await getTopArtists(req.spotifyToken, timeRange);
    res.json(data);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

router.get("/top-tracks", requireSpotifyToken, async (req, res) => {
  const timeRange = req.query.time_range || "medium_term";
  try {
    const data = await getTopTracks(req.spotifyToken, timeRange);
    res.json(data);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

router.get("/recently-played", requireSpotifyToken, async (req, res) => {
  try {
    const data = await getRecentlyPlayed(req.spotifyToken);
    res.json(data);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
