// backend/src/models/Lesson.js
const mongoose = require("mongoose");

const LEVELS = ["A1", "A2", "B1", "B2"];

// ---------- sub schemas ----------
const VocabSchema = new mongoose.Schema(
  {
    ru: { type: String, required: true, trim: true },
    tj: { type: String, required: true, trim: true },
    exampleRu: { type: String, default: "", trim: true },
    exampleTj: { type: String, default: "", trim: true },
  },
  { _id: false }
);

const ListeningSchema = new mongoose.Schema(
  {
    textRu: { type: String, default: "", trim: true },
    audioUrl: { type: String, default: "", trim: true },
  },
  { _id: false }
);

const QuizSchema = new mongoose.Schema(
  {
    q: { type: String, required: true, trim: true },
    options: {
      type: [String],
      validate: {
        validator: function (arr) {
          return Array.isArray(arr) && arr.length === 3 && arr.every((s) => typeof s === "string");
        },
        message: "Quiz.options must be an array of exactly 3 strings",
      },
      default: ["", "", ""],
      required: true,
    },
    correct: { type: Number, min: 0, max: 2, required: true, default: 0 },
  },
  { _id: false }
);

// ---------- main schema ----------
const LessonSchema = new mongoose.Schema(
  {
    seedKey: { type: String, unique: true, index: true, sparse: true },

    title: { type: String, required: true, trim: true },

    level: { type: String, required: true, enum: LEVELS, index: true },

    // ✅ order = 1..60 (A1 1..15, A2 16..30, B1 31..45, B2 46..60)
    order: { type: Number, default: 0, index: true },

    topic: { type: String, required: true, trim: true, index: true },

    coverImage: { type: String, default: "", trim: true },

    vocab: {
      type: [VocabSchema],
      default: [],
      validate: {
        validator: function (arr) {
          return Array.isArray(arr);
        },
        message: "vocab must be an array",
      },
    },

    listening: { type: ListeningSchema, default: () => ({ textRu: "", audioUrl: "" }) },

    // ✅ иҷозат медиҳем холӣ ҳам бошад (барои flexibility)
    quiz: {
      type: [QuizSchema],
      default: [],
      validate: {
        validator: function (arr) {
          return Array.isArray(arr);
        },
        message: "quiz must be an array",
      },
    },

    isPublished: { type: Boolean, default: false, index: true },

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null, index: true },
  },
  { timestamps: true }
);

LessonSchema.index({ level: 1, order: 1 });
LessonSchema.index({ level: 1, topic: 1 });

// ✅ IMPORTANT: export MODEL (not schema)
module.exports = mongoose.models.Lesson || mongoose.model("Lesson", LessonSchema);