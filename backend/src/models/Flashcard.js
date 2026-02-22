const mongoose = require("mongoose");

const FlashcardSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    lessonId: { type: mongoose.Schema.Types.ObjectId, ref: "Lesson", index: true },

    front: { type: String, required: true, trim: true }, // RU
    back: { type: String, required: true, trim: true },  // TJ
    example: { type: String, default: "" },

    dueAt: { type: Date, default: () => new Date() },
    intervalDays: { type: Number, default: 0 },
    ease: { type: Number, default: 2.5 },
    reps: { type: Number, default: 0 },
  },
  { timestamps: true }
);

FlashcardSchema.index({ userId: 1, dueAt: 1 });

module.exports = mongoose.model("Flashcard", FlashcardSchema);