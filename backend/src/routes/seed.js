const express = require("express");
const bcrypt = require("bcrypt");
const User = require("../models/User");
const Lesson = require("../models/Lesson");

const router = express.Router();

// POST /api/seed
router.post("/", async (req, res) => {
  const usersCount = await User.countDocuments();
  const lessonsCount = await Lesson.countDocuments();

  // create admin if none
  let admin = await User.findOne({ email: "admin@test.com" });
  if (!admin) {
    const passwordHash = await bcrypt.hash("admin12345", 10);
    admin = await User.create({ name: "Admin", email: "admin@test.com", passwordHash, role: "admin" });
  }

  // create lesson if none
  if (lessonsCount === 0) {
    await Lesson.create({
      title: "Приветствия",
      level: "A1",
      topic: "Start",
      vocab: [
        { ru: "Привет", tj: "Салом", exampleRu: "Привет! Как дела?", exampleTj: "Салом! Чӣ хел?" },
        { ru: "Как дела?", tj: "Чӣ хел?", exampleRu: "Как дела?", exampleTj: "Чӣ хел?" },
        { ru: "Спасибо", tj: "Ташаккур", exampleRu: "Спасибо!", exampleTj: "Ташаккур!" },
      ],
      listening: { textRu: "Здравствуйте, как вас зовут?", audioUrl: "" },
      quiz: { q: "«Спасибо» ба тоҷикӣ чӣ мешавад?", options: ["Салом", "Ташаккур", "Чӣ хел?"], correct: 1 },
      isPublished: true,
      createdBy: admin._id,
    });
  }

  res.json({
    ok: true,
    adminLogin: { email: "admin@test.com", password: "admin12345" },
    notes: "Ба хотири амният: баъдтар паролро иваз кун!",
    usersCount,
    lessonsCount,
  });
});

module.exports = router;