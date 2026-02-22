function vocabToCards(vocab) {
  return (vocab || [])
    .filter(v => v?.ru && v?.tj)
    .map(v => ({
      front: v.ru.trim(),
      back: v.tj.trim(),
      example: v.exampleRu ? v.exampleRu : "",
    }));
}

module.exports = { vocabToCards };