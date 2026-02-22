function applyReview(card, grade) {
  let q = 3;
  if (grade === "easy") q = 5;
  if (grade === "hard") q = 2;

  let ease = card.ease || 2.5;
  ease = Math.max(1.3, ease + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02)));

  let reps = card.reps || 0;
  let interval = card.intervalDays || 0;

  if (q < 3) {
    reps = 0;
    interval = 1;
  } else {
    reps += 1;
    if (reps === 1) interval = 1;
    else if (reps === 2) interval = 3;
    else interval = Math.max(1, Math.round(interval * ease));
  }

  card.ease = ease;
  card.reps = reps;
  card.intervalDays = interval;
  card.dueAt = new Date(Date.now() + interval * 24 * 60 * 60 * 1000);

  return card;
}

module.exports = { applyReview };