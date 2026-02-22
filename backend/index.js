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
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());

app.get("/api/health", (req, res) => res.json({ status: "OK 🚀" }));

app.use("/api/auth", auth);
app.use("/api/seed", seed);
app.use("/api/lessons", lessons);
app.use("/api/flashcards", flashcards);
app.use("/api/progress", progress);
app.use("/api/admin", admin);

const PORT = process.env.PORT || 5000;

connectDB(process.env.MONGO_URI).then(() => {
  app.listen(PORT, () => console.log(`🚀 API http://localhost:${PORT}`));
});