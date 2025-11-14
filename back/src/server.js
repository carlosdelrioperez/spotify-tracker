import express from "express";
import cors from "cors";
import routes from "./routes.js";
import dotenv from "dotenv";

dotenv.config();
console.log("CLIENT ID:", process.env.SPOTIFY_CLIENT_ID);
const app = express();
app.use(cors());
app.use(express.json());

// Rutas
app.use("/", routes);

const PORT = 3000;
app.listen(PORT, () => console.log("Server running on port", PORT));
