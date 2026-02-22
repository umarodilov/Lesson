const express = require("express");
const mongoose = require("mongoose");
const Progress = require("../models/Progress");
const { authRequired } = require("../middleware/auth");

const router = express.Router();

// GET /api/progress
router.get("/", authRequired, async (req, res) => {
  try {
    const list = await Progress.find({ userId: req.user.userId }).sort({ updatedAt: -1 });
    res.json(list);
  } catch (e) {
    console.error("PROGRESS GET ERROR:", e);
    res.status(500).json({ message: "Progress read failed" });
  }
});

// POST /api/progress  (upsert)
router.post("/", authRequired, async (req, res) => {
  try {
    const { lessonId, completed, vocabDone, quizDone, score } = req.body || {};
    if (!lessonId) return res.status(400).json({ message: "lessonId required" });

    // ✅ cast to ObjectId (ҳал мекунад CastError)
    const lessonObjId = new mongoose.Types.ObjectId(String(lessonId));
    const userObjId = new mongoose.Types.ObjectId(String(req.user.userId));

    const update = {
      completed: !!completed,
      vocabDone: !!vocabDone,
      quizDone: !!quizDone,
      score: Number.isFinite(Number(score)) ? Number(score) : 0,
      lastSeenAt: new Date(),
    };

    const doc = await Progress.findOneAndUpdate(
      { userId: userObjId, lessonId: lessonObjId },
      { $set: update, $setOnInsert: { userId: userObjId, lessonId: lessonObjId } },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    res.json(doc);
  } catch (e) {
    console.error("PROGRESS POST ERROR:", e);

    // ✅ duplicate key (агар index/duplicate шавад)
    if (e?.code === 11000) {
      return res.status(409).json({ message: "Progress already exists (duplicate key)" });
    }

    // ✅ invalid ObjectId
    if (e?.name === "BSONError" || e?.name === "CastError") {
      return res.status(400).json({ message: "Invalid lessonId" });
    }

    res.status(500).json({ message: "Progress save failed" });
  }
});

module.exports = router;