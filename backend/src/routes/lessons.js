const express = require("express");
const Lesson = require("../models/Lesson");
const Flashcard = require("../models/Flashcard");
const { authRequired, adminOnly } = require("../middleware/auth");
const { vocabToCards } = require("../utils/cards");

const router = express.Router();

/**
 * ✅ Public list (sorted by order ASC)
 * Supports pagination:
 * GET /api/lessons?page=1&limit=4
 *
 * Response:
 * { items, total, page, limit }
 */
router.get("/", async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page || "1", 10));
    const limit = Math.max(1, parseInt(req.query.limit || "100", 10)); // default: all
    const skip = (page - 1) * limit;

    const filter = { isPublished: true };

    const [items, total] = await Promise.all([
      Lesson.find(filter)
        // ✅ PO PAREDKA:
        // 1) order ASC (A1 1..15, A2 16..30, B1 31..45, B2 46..60)
        // 2) fallback: createdAt ASC (if order missing)
        .sort({ order: 1, createdAt: 1 })
        .skip(skip)
        .limit(limit),
      Lesson.countDocuments(filter),
    ]);

    res.json({ items, total, page, limit });
  } catch (e) {
    res.status(500).json({ message: e.message || "Server error" });
  }
});

// public detail
router.get("/:id", async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.id);
    if (!lesson) return res.status(404).json({ message: "Not found" });
    res.json(lesson);
  } catch (e) {
    res.status(500).json({ message: e.message || "Server error" });
  }
});

// admin create lesson
router.post("/", authRequired, adminOnly, async (req, res) => {
  try {
    const doc = await Lesson.create({ ...req.body, createdBy: req.user.userId });
    res.status(201).json(doc);
  } catch (e) {
    res.status(400).json({ message: e.message || "Bad request" });
  }
});

// admin update
router.put("/:id", authRequired, adminOnly, async (req, res) => {
  try {
    const doc = await Lesson.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!doc) return res.status(404).json({ message: "Not found" });
    res.json(doc);
  } catch (e) {
    res.status(400).json({ message: e.message || "Bad request" });
  }
});

// admin delete
router.delete("/:id", authRequired, adminOnly, async (req, res) => {
  try {
    const doc = await Lesson.findByIdAndDelete(req.params.id);
    if (!doc) return res.status(404).json({ message: "Not found" });
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ message: e.message || "Server error" });
  }
});

/**
 * POST /api/lessons/:id/generate-cards
 * Auth required. Generates flashcards for THIS user from lesson vocab.
 * (Ҳар user кортҳои худашро мегирад)
 */
router.post("/:id/generate-cards", authRequired, async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.id);
    if (!lesson) return res.status(404).json({ message: "Lesson not found" });

    const raw = vocabToCards(lesson.vocab);
    if (raw.length === 0) return res.json({ created: 0 });

    // Avoid duplicates: delete old user+lesson cards then insert new
    await Flashcard.deleteMany({ userId: req.user.userId, lessonId: lesson._id });

    const docs = raw.map((c) => ({
      ...c,
      userId: req.user.userId,
      lessonId: lesson._id,
    }));

    await Flashcard.insertMany(docs);

    res.json({ created: docs.length });
  } catch (e) {
    res.status(500).json({ message: e.message || "Server error" });
  }
});

// ✅ GET by order (for gating/unlock)
router.get("/by-order/:order", async (req, res) => {
  try {
    const order = Number(req.params.order || 0);
    if (!Number.isFinite(order) || order <= 0) {
      return res.status(400).json({ message: "Bad order" });
    }

    const lesson = await Lesson.findOne({ isPublished: true, order });
    if (!lesson) return res.status(404).json({ message: "Not found" });

    // only need id + order, but return full ok
    res.json(lesson);
  } catch (e) {
    res.status(500).json({ message: e.message || "Server error" });
  }
});

module.exports = router;