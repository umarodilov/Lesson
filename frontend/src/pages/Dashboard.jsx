import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Topbar from "../components/Topbar";
import { apiLessons, apiGetProgress } from "../api/api";

// ----------------- helpers -----------------

/**
 * Extract lesson number from title:
 * "A1 • Дарс 13: Дом" or "Дарс 13: ..." or "Дарс: 13 ..."
 */
function getLessonNumber(lessonOrTitle) {
  const t = String(
    typeof lessonOrTitle === "string" ? lessonOrTitle : lessonOrTitle?.title || ""
  );

  let m = t.match(/дарс\s*[:\-]?\s*(\d{1,3})/i);
  if (m) return Number(m[1]);

  m = t.match(/(\d{1,3})/);
  if (m) return Number(m[1]);

  return 0;
}

/** Rank levels for global order */
const LEVEL_ORDER = ["A1", "A2", "B1", "B2"];
function levelRank(level) {
  const lv = String(level || "").toUpperCase();
  const idx = LEVEL_ORDER.indexOf(lv);
  return idx === -1 ? 999 : idx;
}

/**
 * Remove duplicate prefix from title:
 * "A1 • Дарс 3: Числа" -> "Числа"
 * "Дарс 3: Числа" -> "Числа"
 */
function cleanLessonTitle(title) {
  const t = String(title || "").trim();

  return t
    .replace(
      /^\s*(A1|A2|B1|B2)\s*[•\-–—]\s*дарс\s*[:\-]?\s*\d+\s*[:\-–—]\s*/i,
      ""
    )
    .replace(/^\s*дарс\s*[:\-]?\s*\d+\s*[:\-–—]\s*/i, "")
    .trim();
}

/** Create key for maps: "A1-12" */
function keyOf(level, num) {
  return `${String(level || "A1").toUpperCase()}-${Number(num) || 0}`;
}

export default function Dashboard() {
  const nav = useNavigate();

  const [pageLessons, setPageLessons] = useState([]); // lessons for current page (UI)
  const [allLessons, setAllLessons] = useState([]); // ALL lessons (for unlock logic)
  const [progress, setProgress] = useState([]);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  // ✅ pagination
  const [page, setPage] = useState(1);
  const limit = 4;
  const [total, setTotal] = useState(0);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil((total || 0) / limit)),
    [total, limit]
  );

  const pageNumbers = useMemo(() => {
    const p = page;
    const last = totalPages;
    if (last <= 7) return Array.from({ length: last }, (_, i) => i + 1);

    const nums = new Set([1, last, p, p - 1, p + 1, p - 2, p + 2]);
    const arr = [...nums]
      .filter((n) => n >= 1 && n <= last)
      .sort((a, b) => a - b);

    const out = [];
    for (let i = 0; i < arr.length; i++) {
      out.push(arr[i]);
      if (i < arr.length - 1 && arr[i + 1] - arr[i] > 1) out.push(0);
    }
    return out;
  }, [page, totalPages]);

  // ----------------- data loading -----------------

  async function fetchAllLessonsUsingPagination(totalCount) {
    // We already got page 1 in load(). Now fetch remaining pages if needed.
    const per = 100; // bigger to reduce requests
    const pages = Math.ceil((totalCount || 0) / per);
    if (pages <= 1) return [];

    const tasks = [];
    for (let p = 2; p <= pages; p++) {
      tasks.push(apiLessons({ page: p, limit: per }));
    }

    const res = await Promise.all(tasks);
    const items = [];
    for (const r of res) {
      const list = Array.isArray(r?.items)
        ? r.items
        : Array.isArray(r)
        ? r
        : [];
      items.push(...list);
    }
    return items;
  }

  async function load(p = page) {
    setErr("");
    setLoading(true);

    try {
      // 1) page lessons for UI
      const pageResPromise = apiLessons({ page: p, limit });

      // 2) first page of "all lessons" with bigger limit to know total
      const allFirstPromise = apiLessons({ page: 1, limit: 100 });

      // 3) progress
      const progressPromise = apiGetProgress();

      const [pageRes, allFirst, pRes] = await Promise.all([
        pageResPromise,
        allFirstPromise,
        progressPromise,
      ]);

      // page list
      const pageList = Array.isArray(pageRes?.items)
        ? pageRes.items
        : Array.isArray(pageRes)
        ? pageRes
        : [];

      const totalCount = Number(
        pageRes?.total ??
          allFirst?.total ??
          pageList.length ??
          (Array.isArray(allFirst?.items) ? allFirst.items.length : 0) ??
          0
      );

      // fetch rest of lessons for unlock calculation
      const firstAllList = Array.isArray(allFirst?.items)
        ? allFirst.items
        : Array.isArray(allFirst)
        ? allFirst
        : [];

      const rest = await fetchAllLessonsUsingPagination(totalCount);
      const mergedAll = [...firstAllList, ...rest];

      // sort ALL lessons by (levelRank, lessonNumber), fallback createdAt
      const sortedAll = [...mergedAll].sort((a, b) => {
        const ar = levelRank(a?.level);
        const br = levelRank(b?.level);
        if (ar !== br) return ar - br;

        const an = getLessonNumber(a);
        const bn = getLessonNumber(b);
        if (an && bn) return an - bn;
        if (an) return -1;
        if (bn) return 1;

        return new Date(a?.createdAt || 0) - new Date(b?.createdAt || 0);
      });

      // sort page lessons the same way (so UI consistent)
      const sortedPage = [...pageList].sort((a, b) => {
        const ar = levelRank(a?.level);
        const br = levelRank(b?.level);
        if (ar !== br) return ar - br;

        const an = getLessonNumber(a);
        const bn = getLessonNumber(b);
        if (an && bn) return an - bn;
        if (an) return -1;
        if (bn) return 1;

        return new Date(a?.createdAt || 0) - new Date(b?.createdAt || 0);
      });

      setPageLessons(sortedPage);
      setAllLessons(sortedAll);

      setProgress(Array.isArray(pRes) ? pRes : []);
      setTotal(totalCount);

      setPage(Number(pageRes?.page || p));
    } catch (e) {
      setErr(e.message || "Error");
      setPageLessons([]);
      setAllLessons([]);
      setProgress([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  // ----------------- progress maps -----------------

  const progMapByLessonId = useMemo(() => {
    const m = new Map();
    for (const p of progress) {
      const key = typeof p.lessonId === "string" ? p.lessonId : p.lessonId?._id;
      if (key) m.set(key, p);
    }
    return m;
  }, [progress]);

  function scoreOf(lessonId) {
    const p = progMapByLessonId.get(lessonId);
    return p?.score ?? 0;
  }

  // completed keys by (level, num)
  const completedKeySet = useMemo(() => {
    const s = new Set();

    for (const l of allLessons) {
      const lid = l?._id;
      const lv = (l?.level || "A1").toUpperCase();
      const num = getLessonNumber(l);
      if (!lid || !num) continue;

      const pr = progMapByLessonId.get(lid);
      if (pr?.completed && (pr?.score ?? 0) >= 80) {
        s.add(keyOf(lv, num));
      }
    }
    return s;
  }, [allLessons, progMapByLessonId]);

  // max lesson number for each level (A1/A2/B1/B2)
  const maxNumByLevel = useMemo(() => {
    const m = new Map(); // level -> maxNum
    for (const l of allLessons) {
      const lv = (l?.level || "A1").toUpperCase();
      const num = getLessonNumber(l);
      if (!num) continue;
      const cur = m.get(lv) || 0;
      if (num > cur) m.set(lv, num);
    }
    return m;
  }, [allLessons]);

  function prevLevel(level) {
    const lv = String(level || "A1").toUpperCase();
    const idx = LEVEL_ORDER.indexOf(lv);
    if (idx <= 0) return null;
    return LEVEL_ORDER[idx - 1];
  }

  // ✅ unlock rule (универсалӣ)
  function isUnlocked(lesson) {
    const lv = (lesson?.level || "A1").toUpperCase();
    const n = getLessonNumber(lesson);
    if (!n) return false;

    // First ever lesson is always open
    if (lv === "A1" && n === 1) return true;

    // Within same level: lesson N opens after lesson N-1 completed
    if (n > 1) {
      return completedKeySet.has(keyOf(lv, n - 1));
    }

    // n === 1 for next levels: open only after previous level last lesson completed
    const pl = prevLevel(lv);
    if (!pl) return false;

    const maxPrev = maxNumByLevel.get(pl) || 0;
    if (!maxPrev) return false;

    return completedKeySet.has(keyOf(pl, maxPrev));
  }

  function go(p) {
    if (p < 1 || p > totalPages) return;
    setPage(p);
  }

  return (
    <>
      <Topbar />
      <main className="container py-4">
        {err && <div className="alert alert-danger rounded-4">{err}</div>}

        <div className="row g-3">
          <div className="col-lg-8">
            <div className="glass p-4">
              <div className="d-flex align-items-start justify-content-between gap-2 flex-wrap">
                <div>
                  <div className="small text-secondary">Асосӣ</div>
                  <div className="h4 m-0" style={{ fontWeight: 900 }}>
                    Дарсҳоро интихоб кун
                  </div>
                  <div className="small text-secondary mt-1">
                    {loading ? "Loading..." : `Ҳамагӣ: ${total}`}
                  </div>
                </div>

                <div className="d-flex gap-2 flex-wrap align-items-center">
                  <span className="small text-secondary">
                    {page}/{totalPages}
                  </span>
                  <button
                    className="btn btn-soft rounded-4"
                    onClick={() => load(page)}
                    disabled={loading}
                  >
                    Аз нав бор кардан
                  </button>
                </div>
              </div>

              <div className="row g-3 mt-2">
                {pageLessons.map((l) => {
                  const unlocked = isUnlocked(l);
                  const sc = scoreOf(l._id);
                  const vocabCount = l.vocab?.length || 0;

                  const num = getLessonNumber(l);
                  const clean = cleanLessonTitle(l.title);

                  const header = `${(l.level || "A1").toUpperCase()} • ${
                    num ? `Дарс ${num}` : "Дарс"
                  }: ${clean}`;

                  return (
                    <div className="col-12 col-md-6" key={l._id}>
                      <div
                        className={
                          "card-mini h-100 " + (!unlocked ? "opacity-75" : "")
                        }
                      >
                        <div className="d-flex justify-content-between align-items-start gap-2">
                          <div style={{ minWidth: 0 }}>
                            <div
                              className="fw-bold"
                              style={{ wordBreak: "break-word" }}
                            >
                              {header}
                            </div>
                            <div className="small text-secondary">
                              Сатҳ: {(l.level || "A1").toUpperCase()} • Калимаҳо:{" "}
                              {vocabCount}
                            </div>
                          </div>

                          <span className="badge badge-soft rounded-pill px-3 py-2">
                            ⭐ {sc}%
                          </span>
                        </div>

                        <div
                          className="progress mt-3"
                          style={{
                            height: 10,
                            borderRadius: 999,
                            background: "#e2e8f0",
                          }}
                        >
                          <div
                            className="progress-bar"
                            style={{
                              width: `${sc}%`,
                              background:
                                "linear-gradient(90deg,#10b981,#84cc16,#f59e0b)",
                            }}
                          />
                        </div>

                        {!unlocked && (
                          <div className="small text-secondary mt-3">
                            🔒 Барои кушодан: дарси қаблӣ <b>completed</b> ва{" "}
                            <b>score ≥ 80</b> шавад.
                          </div>
                        )}

                        <div className="d-flex gap-2 flex-wrap mt-3">
                          <button
                            className={
                              "btn rounded-4 " +
                              (unlocked ? "btn-primary" : "btn-secondary")
                            }
                            disabled={!unlocked}
                            onClick={() => nav(`/app/lesson/${l._id}`)}
                          >
                            {unlocked ? "Кушодан" : "Қулф"}
                          </button>

                          <button
                            className="btn btn-soft rounded-4"
                            disabled={!unlocked}
                            onClick={() =>
                              nav(`/app/flashcards?lessonId=${l._id}`)
                            }
                          >
                            Флешкортҳо
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {pageLessons.length === 0 && !err && !loading && (
                  <div className="text-secondary">
                    Дарс нест. Аввал `/api/seed` кун.
                  </div>
                )}
              </div>

              {totalPages > 1 && (
                <div className="mt-4 d-flex justify-content-center align-items-center gap-2 flex-wrap">
                  <button
                    className="btn btn-soft rounded-4 px-3"
                    disabled={loading || page <= 1}
                    onClick={() => go(page - 1)}
                  >
                    ←
                  </button>

                  {pageNumbers.map((n, idx) =>
                    n === 0 ? (
                      <span key={`dots-${idx}`} className="text-secondary px-2">
                        ...
                      </span>
                    ) : (
                      <button
                        key={n}
                        className={`btn rounded-4 px-3 ${
                          n === page ? "btn-primary" : "btn-soft"
                        }`}
                        style={{ fontWeight: 900, minWidth: 44 }}
                        disabled={loading}
                        onClick={() => go(n)}
                      >
                        {n}
                      </button>
                    )
                  )}

                  <button
                    className="btn btn-soft rounded-4 px-3"
                    disabled={loading || page >= totalPages}
                    onClick={() => go(page + 1)}
                  >
                    →
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="col-lg-4">
            <div className="glass p-4 h-100">
              <div className="h6 m-0" style={{ fontWeight: 900 }}>
                Нақша
              </div>
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