const express = require("express");
const Lesson = require("../models/Lesson");
const Flashcard = require("../models/Flashcard");
const { authRequired, adminOnly } = require("../middleware/auth");
const { vocabToCards } = require("../utils/cards");

const router = express.Router();

// public list
router.get("/", async (req, res) => {
  const lessons = await Lesson.find({ isPublished: true }).sort({ createdAt: -1 });
  res.json(lessons);
});

// public detail
router.get("/:id", async (req, res) => {
  const lesson = await Lesson.findById(req.params.id);
  if (!lesson) return res.status(404).json({ message: "Not found" });
  res.json(lesson);
});

// admin create lesson
router.post("/", authRequired, adminOnly, async (req, res) => {
  const doc = await Lesson.create({ ...req.body, createdBy: req.user.userId });
  res.status(201).json(doc);
});

// admin update
router.put("/:id", authRequired, adminOnly, async (req, res) => {
  const doc = await Lesson.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!doc) return res.status(404).json({ message: "Not found" });
  res.json(doc);
});

// admin delete
router.delete("/:id", authRequired, adminOnly, async (req, res) => {
  const doc = await Lesson.findByIdAndDelete(req.params.id);
  if (!doc) return res.status(404).json({ message: "Not found" });
  res.json({ ok: true });
});

/**
 * POST /api/lessons/:id/generate-cards
 * Auth required. Generates flashcards for THIS user from lesson vocab.
 * (Ҳар user кортҳои худашро мегирад)
 */
router.post("/:id/generate-cards", authRequired, async (req, res) => {
  const lesson = await Lesson.findById(req.params.id);
  if (!lesson) return res.status(404).json({ message: "Lesson not found" });

  const raw = vocabToCards(lesson.vocab);
  if (raw.length === 0) return res.json({ created: 0 });

  // Avoid duplicates: delete old user+lesson cards then insert new
  await Flashcard.deleteMany({ userId: req.user.userId, lessonId: lesson._id });

  const docs = raw.map(c => ({ ...c, userId: req.user.userId, lessonId: lesson._id }));
  await Flashcard.insertMany(docs);

  res.json({ created: docs.length });
});

module.exports = router;