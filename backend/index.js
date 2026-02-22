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

/**
 * ✅ CORS (Local + Render)
 * - Local: http://localhost:5173
 * - Production: process.env.CLIENT_URL (e.g. https://your-frontend.onrender.com)
 */
const allowedOrigins = [
  "http://localhost:5173",
  process.env.CLIENT_URL,
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, cb) {
      // allow requests with no origin (e.g. Render health checks, Postman)
      if (!origin) return cb(null, true);

      if (allowedOrigins.includes(origin)) return cb(null, true);

      return cb(new Error("Not allowed by CORS: " + origin));
    },
    credentials: true,
  })
);

app.use(express.json());

app.get("/api/health", (req, res) => res.json({ status: "OK 🚀" }));

app.use("/api/auth", auth);
app.use("/api/seed", seed);
app.use("/api/lessons", lessons);
app.use("/api/flashcards", flashcards);
app.use("/api/progress", progress);
app.use("/api/admin", admin);

const PORT = process.env.PORT || 5000;

// ✅ connect DB then start server
connectDB(process.env.MONGO_URI)
  .then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 API running on port ${PORT}`);
      if (process.env.CLIENT_URL) console.log(`🌐 CLIENT_URL: ${process.env.CLIENT_URL}`);
    });
  })
  .catch((err) => {
    console.error("❌ DB connection failed:", err);
    process.exit(1);
  });