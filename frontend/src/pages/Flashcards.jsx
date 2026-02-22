import React, { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import Topbar from "../components/Topbar";
import { apiDueCards, apiReviewCard } from "../api/api";

function useQuery() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

export default function Flashcards() {
  const q = useQuery();
  const lessonId = q.get("lessonId");

  const [cards, setCards] = useState([]);
  const [i, setI] = useState(0);
  const [flip, setFlip] = useState(false);
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");

  async function load() {
    setErr(""); setMsg("");
    try {
      const list = await apiDueCards(lessonId);
      setCards(list);
      setI(0);
      setFlip(false);
      if (list.length === 0) setMsg("Ҳоло кортҳои due нест 🙂 (Generate Cards кун ё баъдтар биё)");
    } catch (e) {
      setErr(e.message);
    }
  }

  useEffect(() => { load(); }, [lessonId]);

  const c = cards[i];

  async function review(grade) {
    if (!c) return;
    try {
      await apiReviewCard(c._id, grade);
      // move to next
      const nextIndex = i + 1;
      if (nextIndex >= cards.length) {
        await load();
      } else {
        setFlip(false);
        setI(nextIndex);
      }
    } catch (e) {
      setErr(e.message);
    }
  }

  return (
    <>
      <Topbar />
      <main className="container py-4">
        {err && <div className="alert alert-danger rounded-4">{err}</div>}
        {msg && <div className="alert alert-info rounded-4">{msg}</div>}

        <div className="row g-3">
          <div className="col-lg-8">
            <div className="glass p-4">
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <div className="small text-secondary">Флешкортҳо</div>
                  <div className="h4 m-0" style={{ fontWeight: 900 }}>Такрор кун</div>
                </div>
                <div className="small text-secondary">{cards.length ? `${i+1}/${cards.length}` : "0/0"}</div>
              </div>

              <div className="mt-4">
                {c ? (
                  <>
                    <div className="flashCard" onClick={() => setFlip(v => !v)}>
                      <div style={{ fontWeight: 900, fontSize: "clamp(1.8rem,4vw,2.6rem)", color:"#1d4ed8" }}>
                        {flip ? c.back : c.front}
                      </div>
                      <div className="small text-secondary mt-2">Барои гардондан клик кун</div>
                      {c.example && <div className="small text-secondary mt-2">Мисол: {c.example}</div>}
                    </div>

                    <div className="mt-4 d-flex flex-wrap gap-2 justify-content-center">
                      <button className="btn btn-success rounded-4 px-4" style={{ fontWeight: 900 }} onClick={() => review("easy")}>Осон</button>
                      <button className="btn btn-primary rounded-4 px-4" style={{ fontWeight: 900 }} onClick={() => review("good")}>Хуб</button>
                      <button className="btn btn-danger rounded-4 px-4" style={{ fontWeight: 900 }} onClick={() => review("hard")}>Душвор</button>
                    </div>
                  </>
                ) : (
                  <div className="text-secondary">Корт нест.</div>
                )}
              </div>
            </div>
          </div>

          <div className="col-lg-4">
            <div className="glass p-4 h-100">
              <div className="h6 m-0" style={{ fontWeight: 900 }}>Идоракунӣ</div>
              <p className="small-muted mt-2">
                Агар корт нест: дар Lesson → Generate Cards кун.
              </p>
              <button className="btn btn-soft rounded-4 w-100" onClick={load}>Аз нав бор кардан</button>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}