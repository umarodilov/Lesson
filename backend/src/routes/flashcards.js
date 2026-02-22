const express = require("express");
const Flashcard = require("../models/Flashcard");
const { authRequired } = require("../middleware/auth");
const { applyReview } = require("../utils/srs");

const router = express.Router();

// GET /api/flashcards?due=1&lessonId=...
router.get("/", authRequired, async (req, res) => {
  const { lessonId, due } = req.query;

  const filter = { userId: req.user.userId };
  if (lessonId) filter.lessonId = lessonId;
  if (due === "1") filter.dueAt = { $lte: new Date() };

  const cards = await Flashcard.find(filter).sort({ dueAt: 1, createdAt: -1 }).limit(50);
  res.json(cards);
});

// POST /api/flashcards (manual add)
router.post("/", authRequired, async (req, res) => {
  const doc = await Flashcard.create({ ...req.body, userId: req.user.userId });
  res.status(201).json(doc);
});

// POST /api/flashcards/:id/review {grade}
router.post("/:id/review", authRequired, async (req, res) => {
  const { grade } = req.body || {};
  const card = await Flashcard.findOne({ _id: req.params.id, userId: req.user.userId });
  if (!card) return res.status(404).json({ message: "Not found" });

  applyReview(card, grade);
  await card.save();
  res.json(card);
});

module.exports = router;