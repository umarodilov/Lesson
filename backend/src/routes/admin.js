const express = require("express");
const { authRequired, adminOnly } = require("../middleware/auth");
const User = require("../models/User");
const Lesson = require("../models/Lesson");
const Flashcard = require("../models/Flashcard");

const router = express.Router();

// ҳамааш admin-only
router.use(authRequired, adminOnly);

// GET /api/admin/users
router.get("/users", async (req, res) => {
  const users = await User.find({}, { passwordHash: 0 }).sort({ createdAt: -1 }).limit(200);
  res.json(users);
});

// GET /api/admin/lessons  (ҳам published ҳам unpublished)
router.get("/lessons", async (req, res) => {
  const lessons = await Lesson.find({}).sort({ createdAt: -1 });
  res.json(lessons);
});

// GET /api/admin/stats
router.get("/stats", async (req, res) => {
  const [users, lessons, cards] = await Promise.all([
    User.countDocuments(),
    Lesson.countDocuments(),
    Flashcard.countDocuments(),
  ]);

  res.json({ users, lessons, cards });
});

module.exports = router;