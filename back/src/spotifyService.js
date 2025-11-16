import axios from "axios";

export const getTopArtists = async (token, time_range = "medium_term") => {
  const res = await axios.get(
    `https://api.spotify.com/v1/me/top/artists?time_range=${time_range}&limit=20`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return res.data;
};

export async function getTopTracks(token, time_range = "medium_term") {
  const res = await axios.get(
    `https://api.spotify.com/v1/me/top/tracks?limit=20&time_range=${time_range}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return res.data;
}

export async function getRecentlyPlayed(token, time_range = "medium_term") {
  const res = await axios.get(
    "https://api.spotify.com/v1/me/player/recently-played?limit=20",
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return res.data;
}

export async function getCurrentTrack(params) {}

export async function getUsername(token) {
  const res = await axios.get("https://api.spotify.com/v1/me", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}
