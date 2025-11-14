import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

function Logged() {
  const location = useLocation();
  const navigate = useNavigate();
  const [accessToken, setAccessToken] = useState(null);
  const [topArtists, setTopArtists] = useState([]);
  const [topTracks, setTopTracks] = useState([]);
  const [recentTracks, setRecentTracks] = useState([]);
  const [activeTab, setActiveTab] = useState("artists");
  const [timeRange, setTimeRange] = useState("medium_term");

  // Función para obtener datos del backend según el token y timeRange
  const fetchData = (token, range) => {
    fetch(`http://127.0.0.1:3000/top-artists?time_range=${range}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setTopArtists(data.items || []))
      .catch((err) => console.error(err));

    fetch(`http://127.0.0.1:3000/top-tracks?time_range=${range}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setTopTracks(data.items || []))
      .catch((err) => console.error(err));

    // ✅ Fetch de las últimas canciones reproducidas
    fetch(`http://127.0.0.1:3000/recently-played`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setRecentTracks(data.items || []))
      .catch((err) => console.error(err));
  };

  // useEffect para inicializar token y cargar datos
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    let token =
      params.get("access_token") || localStorage.getItem("access_token");

    if (!token) {
      navigate("/");
      return;
    }

    localStorage.setItem("access_token", token);
    setAccessToken(token);

    // Se necesita cargar los datos cada vez que `timeRange` cambie.
    // Aunque el token no cambie, `fetchData` debe ejecutarse con el nuevo `timeRange`.
    fetchData(token, timeRange);
  }, [location, navigate, timeRange]); // Dependencia timeRange es crucial

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    setAccessToken(null);
    setTopArtists([]);
    setTopTracks([]);
    setRecentTracks([]);
    navigate("/");
  };

  return (
    <div
      className="min-h-screen text-white p-4 sm:p-6" // Ajuste de padding en móvil
      style={{ backgroundColor: "#111112" }}
    >
      <header className="flex flex-col sm:flex-row justify-between items-center mb-6 sm:mb-8">
        <h2 className="text-xl sm:text-3xl font-bold mb-4 sm:mb-0 text-center sm:text-left">
          Tu música en Spotify
        </h2>
        {/* Contenedor de botones: flex-wrap para que se envuelvan en pantallas pequeñas */}
        <div className="flex flex-wrap justify-center gap-2 sm:gap-4">
          <button
            onClick={() => setActiveTab("artists")}
            className={`text-sm sm:text-base px-3 py-1 sm:px-4 sm:py-2 rounded-full font-semibold transition whitespace-nowrap ${
              activeTab === "artists"
                ? "bg-green-500 text-black"
                : "bg-black bg-opacity-20 hover:bg-opacity-40"
            }`}
          >
            Top Artistas
          </button>
          <button
            onClick={() => setActiveTab("tracks")}
            className={`text-sm sm:text-base px-3 py-1 sm:px-4 sm:py-2 rounded-full font-semibold transition whitespace-nowrap ${
              activeTab === "tracks"
                ? "bg-green-500 text-black"
                : "bg-black bg-opacity-20 hover:bg-opacity-40"
            }`}
          >
            Top Canciones
          </button>
          <button
            onClick={() => setActiveTab("recent")}
            className={`text-sm sm:text-base px-3 py-1 sm:px-4 sm:py-2 rounded-full font-semibold transition whitespace-nowrap ${
              activeTab === "recent"
                ? "bg-green-500 text-black"
                : "bg-black bg-opacity-20 hover:bg-opacity-40"
            }`}
          >
            Últimas escuchadas
          </button>
          <button
            onClick={handleLogout}
            className="text-sm sm:text-base bg-red-500 hover:bg-red-600 px-3 py-1 sm:px-4 sm:py-2 rounded-full shadow-lg transition transform hover:scale-105 whitespace-nowrap"
          >
            Logout
          </button>
        </div>
      </header>

      <hr className="border-gray-700 my-4" />

      <div className="p-4 sm:p-6 bg-opacity-60 rounded-3xl backdrop-blur-md">
        {activeTab !== "recent" && (
          <div className="flex justify-center sm:justify-end mb-4">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="bg-black bg-opacity-20 text-white px-3 py-2 rounded-full font-medium hover:bg-opacity-40 transition text-sm sm:text-base"
            >
              <option value="short_term">Último mes</option>
              <option value="medium_term">Últimos 6 meses</option>
              <option value="long_term">Todos los tiempos</option>
            </select>
          </div>
        )}

        {/* Las grillas ya son responsive (grid-cols-1, sm:grid-cols-2, etc.) */}
        {activeTab === "artists" && (
          <section>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
              {topArtists.map((artist, index) => (
                <div
                  key={artist.id}
                  className="bg-opacity-10 bg-gray-900 p-3 rounded-xl flex flex-col items-center text-center shadow-lg hover:scale-105 transition transform"
                >
                  {artist.images && artist.images[0] ? (
                    <img
                      src={artist.images[0].url}
                      alt={artist.name}
                      // Proporción más amigable para móviles
                      className="w-full aspect-square object-cover rounded-full sm:rounded-lg mb-2"
                    />
                  ) : (
                    <div className="w-full aspect-square rounded-full sm:rounded-lg bg-gray-700 mb-2 flex items-center justify-center text-black text-2xl">
                      ?
                    </div>
                  )}
                  <p className="text-sm sm:text-base font-medium">
                    {index + 1}. {artist.name}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {activeTab === "tracks" && (
          <section>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
              {topTracks.map((track, index) => (
                <div
                  key={track.id}
                  className="bg-opacity-10 bg-gray-900 p-3 rounded-xl flex flex-col items-center text-center shadow-lg hover:scale-105 transition transform"
                >
                  {track.album?.images && track.album.images[0] ? (
                    <img
                      src={track.album.images[0].url}
                      alt={track.name}
                      className="w-full aspect-square object-cover rounded-lg mb-2"
                    />
                  ) : (
                    <div className="w-full aspect-square bg-gray-700 rounded-lg mb-2 flex items-center justify-center text-black text-2xl">
                      ?
                    </div>
                  )}
                  <p className="text-sm sm:text-base font-medium overflow-hidden text-ellipsis whitespace-nowrap w-full">
                    {index + 1}. {track.name}
                  </p>
                  <p className="text-xs sm:text-sm opacity-80 overflow-hidden text-ellipsis whitespace-nowrap w-full">
                    {track.artists.map((a) => a.name).join(", ")}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {activeTab === "recent" && (
          <section>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
              {recentTracks.map((item, index) => (
                <div
                  key={index}
                  className="bg-opacity-10 bg-gray-900 p-3 rounded-xl flex flex-col items-center text-center shadow-lg hover:scale-105 transition transform"
                >
                  {item.track.album?.images && item.track.album.images[0] ? (
                    <img
                      src={item.track.album.images[0].url}
                      alt={item.track.name}
                      className="w-full aspect-square object-cover rounded-lg mb-2"
                    />
                  ) : (
                    <div className="w-full aspect-square bg-gray-700 rounded-lg mb-2 flex items-center justify-center text-black text-2xl">
                      ?
                    </div>
                  )}
                  <p className="text-sm sm:text-base font-medium overflow-hidden text-ellipsis whitespace-nowrap w-full">
                    {index + 1}. {item.track.name}
                  </p>
                  <p className="text-xs sm:text-sm opacity-80 overflow-hidden text-ellipsis whitespace-nowrap w-full">
                    {item.track.artists.map((a) => a.name).join(", ")}
                  </p>
                  <p className="text-xs opacity-60 mt-1">
                    {new Date(item.played_at).toLocaleTimeString()}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

export default Logged;
