import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Topbar from "../components/Topbar";
import { apiLesson, apiGenerateCards, apiSaveProgress } from "../api/api";

export default function Lesson() {
  const { id } = useParams();
  const nav = useNavigate();

  const [lesson, setLesson] = useState(null);
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  // quiz flow
  const [step, setStep] = useState(0);
  const [picked, setPicked] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [locked, setLocked] = useState(false);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    setErr("");
    setMsg("");
    setLoading(false);

    apiLesson(id)
      .then((data) => {
        const quizArr = Array.isArray(data.quiz) ? data.quiz : [];
        setLesson({ ...data, quiz: quizArr });
        setStep(0);
        setPicked(null);
        setAnswers([]);
        setLocked(false);
        setFinished(false);
      })
      .catch((e) => setErr(e.message));
  }, [id]);

  const vocabCount = useMemo(() => lesson?.vocab?.length || 0, [lesson]);
  const quizCount = useMemo(() => lesson?.quiz?.length || 0, [lesson]);

  const lessonOrder = useMemo(() => {
    const n = Number(lesson?.order);
    return Number.isFinite(n) && n > 0 ? n : null;
  }, [lesson]);

  const lessonLabel = useMemo(() => {
    const lvl = lesson?.level || "A1";
    return lessonOrder ? `${lvl} • Дарс ${lessonOrder}` : `${lvl} • Дарс`;
  }, [lesson?.level, lessonOrder]);

  const current = useMemo(() => {
    if (!lesson?.quiz?.length) return null;
    return lesson.quiz[step] || null;
  }, [lesson, step]);

  const score = useMemo(() => {
    if (!answers.length) return 0;
    const correct = answers.filter((a) => a.correct).length;
    return Math.round((correct / Math.max(quizCount, 1)) * 100);
  }, [answers, quizCount]);

  const correctCount = useMemo(() => answers.filter((a) => a.correct).length, [answers]);

  async function generateCards() {
    setMsg("");
    setErr("");
    try {
      setLoading(true);
      const r = await apiGenerateCards(id);
      setMsg(`✅ Флешкортҳо сохта шуданд: ${r.created}`);
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function pickOption(optIdx) {
    if (!current || locked || finished) return;

    setLocked(true);
    setPicked(optIdx);

    const isCorrect = optIdx === (current.correct ?? 0);

    setAnswers((prev) => [...prev, { qIndex: step, picked: optIdx, correct: isCorrect }]);

    setTimeout(async () => {
      const nextStep = step + 1;

      if (nextStep < quizCount) {
        setStep(nextStep);
        setPicked(null);
        setLocked(false);
      } else {
        setFinished(true);
        setLocked(false);

        const finalCorrect = answers.filter((a) => a.correct).length + (isCorrect ? 1 : 0);
        const finalScore = Math.round((finalCorrect / Math.max(quizCount, 1)) * 100);
        const completed = finalScore >= 80;

        try {
          setLoading(true);
          await apiSaveProgress({
            lessonId: id,
            vocabDone: true,
            quizDone: true,
            completed,
            score: finalScore,
          });

          setMsg(
            completed
              ? `✅ Офарин! Score: ${finalScore}% (дарс анҷом шуд)`
              : `⚠️ Score: ${finalScore}%. Барои гузаштан ба дарси дигар 80% лозим. Retry кун.`
          );
        } catch (e) {
          setErr(e.message);
        } finally {
          setLoading(false);
        }
      }
    }, 700);
  }

  function retry() {
    setStep(0);
    setPicked(null);
    setAnswers([]);
    setLocked(false);
    setFinished(false);
    setMsg("");
    setErr("");
  }

  if (err) {
    return (
      <>
        <Topbar />
        <main className="container py-4">
          <div className="alert alert-danger rounded-4">{err}</div>
        </main>
      </>
    );
  }

  if (!lesson) {
    return (
      <>
        <Topbar />
        <main className="container py-4 text-secondary">Loading…</main>
      </>
    );
  }

  return (
    <>
      <Topbar />
      <main className="container py-4">
        {msg && <div className="alert alert-success rounded-4 py-2">{msg}</div>}
        {err && <div className="alert alert-danger rounded-4 py-2">{err}</div>}

        <div className="row g-3">
          {/* Left */}
          <div className="col-lg-8">
            <div className="glass p-4">
              <div className="d-flex align-items-start justify-content-between gap-2 flex-wrap">
                <div style={{ minWidth: 220 }}>
                  <div className="small text-secondary">{lessonLabel}</div>
                  <div className="h4 m-0" style={{ fontWeight: 900, wordBreak: "break-word" }}>
                    {lesson.title}
                  </div>
                  <div className="small text-secondary mt-1">
                    Сатҳ: {lesson.level || "A1"} • Калимаҳо: {vocabCount} • Тест: {quizCount}
                  </div>
                </div>

                <button
                  className="btn btn-soft rounded-4"
                  onClick={() => nav(`/app/flashcards?lessonId=${lesson._id}`)}
                >
                  Флешкортҳо →
                </button>
              </div>

              {/* Vocab */}
              <div className="mt-4">
                <div className="fw-bold">Калимаҳо</div>
                <div className="mt-2 d-grid gap-2">
                  {(lesson.vocab || []).map((v, i) => (
                    <div className="card-mini" key={i}>
                      <div className="d-flex justify-content-between gap-3 flex-wrap">
                        <div className="fw-bold" style={{ color: "#1d4ed8", wordBreak: "break-word" }}>
                          {v.ru}
                        </div>
                        <div className="fw-bold text-secondary" style={{ wordBreak: "break-word" }}>
                          {v.tj}
                        </div>
                      </div>

                      {(v.exampleRu || v.exampleTj) && (
                        <div className="small text-secondary mt-2" style={{ wordBreak: "break-word" }}>
                          {v.exampleRu ? (
                            <>
                              RU: {v.exampleRu}
                              <br />
                            </>
                          ) : null}
                          {v.exampleTj ? <>TJ: {v.exampleTj}</> : null}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Listening */}
              {lesson.listening?.textRu && (
                <div className="mt-4">
                  <div className="fw-bold">Listening</div>
                  <div className="card-mini mt-2">
                    <div className="small text-secondary">Матни RU:</div>
                    <div className="fw-bold mt-1" style={{ wordBreak: "break-word" }}>
                      {lesson.listening.textRu}
                    </div>
                    {lesson.listening.audioUrl ? (
                      <audio className="w-100 mt-2" controls src={lesson.listening.audioUrl} />
                    ) : (
                      <div className="small text-secondary mt-2">Audio ҳоло нест (audioUrl="").</div>
                    )}
                  </div>
                </div>
              )}

              {/* Quiz */}
              <div className="mt-4">
                <div className="fw-bold">
                  Тест (Auto) • {Math.min(step + 1, quizCount)}/{quizCount}
                </div>

                {quizCount === 0 ? (
                  <div className="card-mini mt-2 text-secondary">
                    Ҳоло саволҳо нестанд. Дар seed ё admin, quiz массивро пур кун.
                  </div>
                ) : (
                  <div className="card-mini mt-2">
                    {!finished ? (
                      <>
                        <div className="fw-bold" style={{ wordBreak: "break-word" }}>
                          {current?.q}
                        </div>

                        <div className="row g-2 mt-2">
                          {(current?.options || []).map((t, idx) => {
                            const isPicked = picked === idx;
                            const isCorrect = idx === (current?.correct ?? 0);

                            let btn = "btn-light";
                            if (!locked && isPicked) btn = "btn-soft";
                            if (locked && isPicked && isCorrect) btn = "btn-success";
                            if (locked && isPicked && !isCorrect) btn = "btn-danger";
                            if (locked && !isPicked && isCorrect) btn = "btn-success";

                            return (
                              <div className="col-md-4" key={idx}>
                                <button
                                  className={`w-100 btn rounded-4 ${btn}`}
                                  style={{ fontWeight: 900, whiteSpace: "normal" }}
                                  disabled={loading || locked}
                                  onClick={() => pickOption(idx)}
                                >
                                  {t}
                                </button>
                              </div>
                            );
                          })}
                        </div>

                        {picked !== null && (
                          <div
                            className="mt-3 fw-bold"
                            style={{
                              color: picked === (current?.correct ?? 0) ? "#059669" : "#dc2626",
                            }}
                          >
                            {picked === (current?.correct ?? 0) ? "Дуруст ✅" : "Хато ❌"}
                          </div>
                        )}

                        <div className="small text-secondary mt-2">
                          Қоида: Пахш кунӣ → худкор ҷавоб қабул мешавад ва ба саволи дигар мегузарад.
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="fw-bold">Натиҷа</div>
                        <div className="mt-2">
                          <span className="badge rounded-pill px-3 py-2 bg-primary">Score: {score}%</span>
                          <span className="badge rounded-pill px-3 py-2 bg-secondary ms-2">
                            Correct: {correctCount}/{quizCount}
                          </span>
                        </div>

                        <div className="d-flex gap-2 flex-wrap mt-3">
                          <button className="btn btn-soft rounded-4" onClick={retry} disabled={loading}>
                            Retry
                          </button>
                          <button className="btn btn-primary rounded-4" onClick={generateCards} disabled={loading}>
                            {loading ? "..." : "Generate Cards"}
                          </button>
                        </div>

                        <div className="small text-secondary mt-2">Барои кушодани дарси нав: score ≥ 80%.</div>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right */}
          <div className="col-lg-4">
            <div className="glass p-4 h-100">
              <div className="h6 m-0" style={{ fontWeight: 900 }}>
                Пешрафт
              </div>

              <div className="mt-2">
                <div className="small text-secondary">Ҳолат:</div>
                <div className="fw-bold">
                  {finished ? (score >= 80 ? "✅ Completed" : "⚠️ Need 80%+") : "Дар ҷараён..."}
                </div>
              </div>

              <div className="progress mt-3" style={{ height: 10, borderRadius: 999, background: "#e2e8f0" }}>
                <div
                  className="progress-bar"
                  style={{
                    width: `${finished ? score : Math.round((step / Math.max(quizCount, 1)) * 100)}%`,
                    background: "linear-gradient(90deg,#10b981,#84cc16,#f59e0b)",
                  }}
                />
              </div>

              <div className="d-grid gap-2 mt-3">
                <button className="btn btn-primary rounded-4" onClick={generateCards} disabled={loading}>
                  {loading ? "..." : "Generate Cards"}
                </button>
                <button className="btn btn-soft rounded-4" onClick={() => nav(`/app/flashcards?lessonId=${lesson._id}`)}>
                  Ба флешкортҳо
                </button>
              </div>

              <div className="alert alert-info rounded-4 mt-3 mb-0">
                Маслиҳат: агар score паст шавад → флешкортҳоро 1–2 рӯз истифода кун, баъд retry.
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}