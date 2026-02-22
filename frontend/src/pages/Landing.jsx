import React from "react";
import { useNavigate } from "react-router-dom";
import Topbar from "../components/Topbar";
import { isAuthed } from "../auth/auth";

export default function Landing() {
  const nav = useNavigate();
  const go = () => nav(isAuthed() ? "/app" : "/login");

  return (
    <>
      <Topbar />
      <main className="container py-4">
        <section className="glass overflow-hidden">
          <div className="row g-0">
            <div className="col-lg-6 p-4 p-sm-5">
              <div className="d-flex flex-wrap gap-2 mb-3">
                <span className="badge badge-soft rounded-pill px-3 py-2">✅ Адаптив</span>
                <span className="badge badge-soft rounded-pill px-3 py-2 d-none d-md-inline">⚡ Дарсҳои кӯтоҳ</span>
                <span className="badge badge-soft rounded-pill px-3 py-2 d-none d-md-inline">🧠 Флешкорт</span>
              </div>

              <h1 className="display-6" style={{ fontWeight: 900, letterSpacing: "-.02em" }}>
                Омӯзиши забони русӣ —{" "}
                <span style={{ color: "var(--blue)" }}>осон</span> ва{" "}
                <span style={{ color: "var(--blue)" }}>шавқовар</span>!
              </h1>

              <p className="mt-3 small-muted" style={{ lineHeight: 1.7 }}>
                Аз 0 то сатҳҳои баланд: калимаҳо, шунавоӣ, тест, флешкортҳо ва пешрафт.
              </p>

              <div className="d-flex flex-wrap gap-2 mt-4">
                <button onClick={go} className="btn btn-primary btn-lg rounded-4 px-4">Оғоз мекунем</button>
                <button className="btn btn-soft btn-lg rounded-4 px-4" onClick={() => alert("Demo UI ✅")}>Функсияҳо</button>
              </div>
            </div>

            <div className="col-lg-6 p-4 p-sm-5 heroRight">
              <div className="glass p-3" style={{ background: "rgba(255,255,255,.90)" }}>
                <div className="fw-bold text-dark">Дарси имрӯз</div>
                <div className="small text-secondary mt-1">Салом, шиносоӣ, ҷумлаҳои оддӣ</div>
              </div>

              <div className="mt-3 glass p-3" style={{ background: "rgba(255,255,255,.90)" }}>
                <div className="fw-bold text-dark">Флешкортҳо</div>
                <div className="row g-2 mt-2">
                  <div className="col-6"><div className="card-mini text-center">
                    <div className="fw-bold" style={{ color: "#1d4ed8", fontSize: 20 }}>Привет</div>
                    <div className="small text-secondary mt-1">Салом</div>
                  </div></div>
                  <div className="col-6"><div className="card-mini text-center">
                    <div className="fw-bold" style={{ color: "#1d4ed8", fontSize: 20 }}>Спасибо</div>
                    <div className="small text-secondary mt-1">Ташаккур</div>
                  </div></div>
                </div>
              </div>

              <div className="mt-3 small" style={{ color: "rgba(255,255,255,.75)" }}>
                Версияи пурра: Login + Lessons + Flashcards + Progress ✅
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}