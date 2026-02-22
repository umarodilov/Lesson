const mongoose = require("mongoose");

const ProgressSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    lessonId: { type: mongoose.Schema.Types.ObjectId, ref: "Lesson", required: true, index: true },

    completed: { type: Boolean, default: false },
    vocabDone: { type: Boolean, default: false },
    quizDone: { type: Boolean, default: false },
    score: { type: Number, default: 0 },
    lastSeenAt: { type: Date, default: () => new Date() },
  },
  { timestamps: true }
);

ProgressSchema.index({ userId: 1, lessonId: 1 }, { unique: true });

module.exports = mongoose.model("Progress", ProgressSchema);