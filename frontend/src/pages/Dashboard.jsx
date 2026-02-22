import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Topbar from "../components/Topbar";
import { apiLessons, apiGetProgress } from "../api/api";

export default function Dashboard() {
  const nav = useNavigate();
  const [lessons, setLessons] = useState([]);
  const [progress, setProgress] = useState([]);
  const [err, setErr] = useState("");

  useEffect(() => {
    setErr("");
    Promise.all([apiLessons(), apiGetProgress()])
      .then(([l, p]) => {
        // lessons-ро аз қадим ба нав тартиб диҳем, то gating дуруст шавад
        const sorted = [...l].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        setLessons(sorted);
        setProgress(p || []);
      })
      .catch((e) => setErr(e.message));
  }, []);

  const progMap = useMemo(() => {
    const m = new Map();
    for (const p of progress) {
      const key = typeof p.lessonId === "string" ? p.lessonId : p.lessonId?._id;
      if (key) m.set(key, p);
    }
    return m;
  }, [progress]);

  // ✅ unlock rule: previous lesson completed=true AND score>=80
  function isUnlocked(index) {
    if (index === 0) return true;
    const prev = lessons[index - 1];
    if (!prev) return true;
    const p = progMap.get(prev._id);
    return !!(p?.completed && (p?.score ?? 0) >= 80);
  }

  function scoreOf(lessonId) {
    const p = progMap.get(lessonId);
    return p?.score ?? 0;
  }

  return (
    <>
      <Topbar />
      <main className="container py-4">
        {err && <div className="alert alert-danger rounded-4">{err}</div>}

        <div className="row g-3">
          <div className="col-lg-8">
            <div className="glass p-4">
              <div className="small text-secondary">Асосӣ</div>
              <div className="h4 m-0" style={{ fontWeight: 900 }}>
                Дарсҳоро интихоб кун
              </div>

              <div className="row g-3 mt-2">
                {lessons.map((l, idx) => {
                  const unlocked = isUnlocked(idx);
                  const sc = scoreOf(l._id);
                  const vocabCount = l.vocab?.length || 0;

                  return (
                    <div className="col-md-6" key={l._id}>
                      <div className={"card-mini h-100 " + (!unlocked ? "opacity-75" : "")}>
                        <div className="d-flex justify-content-between align-items-start gap-2">
                          <div>
                            <div className="fw-bold">{l.title}</div>
                            <div className="small text-secondary">
                              Сатҳ: {l.level || "A1"} • Калимаҳо: {vocabCount}
                            </div>
                          </div>

                          <span className="badge badge-soft rounded-pill px-3 py-2">
                            ⭐ {sc}%
                          </span>
                        </div>

                        <div className="progress mt-3" style={{ height: 10, borderRadius: 999, background: "#e2e8f0" }}>
                          <div
                            className="progress-bar"
                            style={{
                              width: `${sc}%`,
                              background: "linear-gradient(90deg,#10b981,#84cc16,#f59e0b)",
                            }}
                          />
                        </div>

                        {!unlocked && (
                          <div className="small text-secondary mt-3">
                            🔒 Барои кушодан: дарси қаблӣ <b>completed</b> ва <b>score ≥ 80</b> шавад.
                          </div>
                        )}

                        <div className="d-flex gap-2 flex-wrap mt-3">
                          <button
                            className={"btn rounded-4 " + (unlocked ? "btn-primary" : "btn-secondary")}
                            disabled={!unlocked}
                            onClick={() => nav(`/app/lesson/${l._id}`)}
                          >
                            {unlocked ? "Кушодан" : "Қулф"}
                          </button>

                          <button
                            className="btn btn-soft rounded-4"
                            disabled={!unlocked}
                            onClick={() => nav(`/app/flashcards?lessonId=${l._id}`)}
                          >
                            Флешкортҳо
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {lessons.length === 0 && !err && (
                  <div className="text-secondary">Дарс нест. Аввал `/api/seed` кун.</div>
                )}
              </div>
            </div>
          </div>

          <div className="col-lg-4">
            <div className="glass p-4 h-100">
              <div className="h6 m-0" style={{ fontWeight: 900 }}>Нақша</div>
              <ol className="small text-secondary mt-2 mb-0">
                <li>Калимаҳо (8–12)</li>
                <li>Диалог (2–4 ҷумла)</li>
                <li>1 қоидаи кӯтоҳ</li>
                <li>Тест (5–8) → auto</li>
                <li>Флешкортҳо (SRS)</li>
              </ol>

              <div className="alert alert-info rounded-4 mt-3 mb-0">
                Барои гузаштан ба дарси дигар: <b>score ≥ 80</b>.
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}