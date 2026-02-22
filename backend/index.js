// index.js
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const { connectDB } = require("./src/db");

const auth = require("./src/routes/auth");
const seed = require("./src/routes/seed");
const lessons = require("./src/routes/lessons");
const flashcards = require("./src/routes/flashcards");
const progress = require("./src/routes/progress");
const admin = require("./src/routes/admin");

const app = express();

/** ✅ CORS: Local + Render Front */
const allowedOrigins = [
  "http://localhost:5173",
  process.env.CLIENT_URL, // example: https://zabon-omuz.onrender.com
].filter(Boolean);

const corsOptions = {
  origin: function (origin, cb) {
    // allow requests with no origin (health checks, Postman)
    if (!origin) return cb(null, true);

    if (allowedOrigins.includes(origin)) return cb(null, true);

    return cb(new Error("Not allowed by CORS: " + origin));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
// ✅ IMPORTANT: Express + Node22: use regex instead of "*"
app.options(/.*/, cors(corsOptions));

app.use(express.json());

app.get("/api/health", (req, res) => res.json({ status: "OK 🚀" }));

app.use("/api/auth", auth);
app.use("/api/seed", seed);
app.use("/api/lessons", lessons);
app.use("/api/flashcards", flashcards);
app.use("/api/progress", progress);
app.use("/api/admin", admin);

const PORT = process.env.PORT || 5000;

connectDB(process.env.MONGO_URI)
  .then(() => {
    app.listen(PORT, () => console.log(`🚀 API running on port ${PORT}`));
  })
  .catch((err) => {
    console.error("❌ DB connection failed:", err);
    process.exit(1);
  });