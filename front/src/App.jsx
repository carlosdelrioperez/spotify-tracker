import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

function App() {
  const navigate = useNavigate();
  const BACKEND_LOGIN = import.meta.env.VITE_SPOTIFY_LOGIN_URL;

  // Comprobar si ya hay sesión activa consultando un endpoint seguro
  useEffect(() => {
    fetch(`${import.meta.env.VITE_BACKEND_URL}/me`, {
      credentials: "include",
    })
      .then((res) => {
        if (res.ok) navigate("/logged");
      })
      .catch((err) => console.error(err));
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col justify-between bg-gradient-to-br from-green-400 via-green-600 to-black text-white">
      {/* Header */}
      <header className="p-8 text-center">
        <h1 className="text-5xl font-extrabold mb-4 tracking-wide drop-shadow-lg">
          Spotify Tracker
        </h1>
        <p className="text-lg max-w-xl mx-auto drop-shadow-md">
          Descubre tus artistas y canciones más escuchados.
        </p>
      </header>

      {/* Main login section */}
      <main className="flex flex-col items-center justify-center flex-1">
        <div className="bg-white bg-opacity-10 backdrop-blur-md p-10 rounded-3xl shadow-xl flex flex-col items-center">
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/2/26/Spotify_logo_with_text.svg"
            alt="Spotify Logo"
            className="w-40 mb-6"
          />
          <button
            onClick={() => (window.location.href = BACKEND_LOGIN)}
            className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-8 rounded-full shadow-lg transition transform hover:scale-105"
          >
            Iniciar sesión con Spotify
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center p-4 text-sm opacity-80">
        &copy; {new Date().getFullYear()} Spotify Tracker.
      </footer>
    </div>
  );
}

export default App;
