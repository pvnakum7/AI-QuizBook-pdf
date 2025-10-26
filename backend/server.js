import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { logInfo, logError } from "./lib/utils/logger.js";
import routes from "./routes/index.js";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

// app.use(cors());
app.use(
  cors({
    origin: "*", // ✅ allow all origins for dev
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// enable JSON + file uploads
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true }));

// static data folder (optional)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use("/data", express.static(path.join(__dirname, "data/uploads")));

// Routes
app.use("/api", routes);

app.get("/", (req, res) => {
  res.send({ message: "AI PDF Citation Backend Running 🚀" });
});

app.use((err, req, res, next) => {
  logError(err);
  res.status(500).json({ error: err.message || "Internal Server Error" });
});

app.listen(PORT, () => logInfo(`✅ Server running on port ${PORT}`));
