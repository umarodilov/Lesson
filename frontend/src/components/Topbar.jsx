import React, { useEffect, useMemo, useState } from "react";
import { NavLink, Link, useLocation, useNavigate } from "react-router-dom";
import { getUser, isAuthed, logout } from "../auth/auth";
import { getInitials } from "../utils/name";

export default function Topbar() {
  const nav = useNavigate();
  const loc = useLocation();
  const authed = isAuthed();
  const user = getUser();

  const initials = useMemo(() => getInitials(user?.name || ""), [user?.name]);

  const [open, setOpen] = useState(false);

  // агар route дигар шуд → меню пӯшида шавад
  useEffect(() => {
    setOpen(false);
  }, [loc.pathname]);

  function doLogout() {
    logout();
    nav("/login");
  }

  const navCls = ({ isActive }) =>
    "nav-link px-3 py-2 rounded-4 fw-bold " +
    (isActive ? "text-white bg-primary" : "text-secondary");

  return (
    <header className="app-topbar border-bottom" style={{ borderColor: "rgba(15,23,42,.08)" }}>
      <div className="container py-3 d-flex align-items-center justify-content-between gap-3">
        {/* Left: Brand */}
        <div className="d-flex align-items-center gap-3">
          <Link to={authed ? "/app" : "/"} className="text-decoration-none">
            <div className="brand fs-5">Zaboni<span>Ru</span></div>
          </Link>
          <div className="d-none d-md-block small text-secondary">
            Омӯзиши русӣ барои тоҷикон
          </div>
        </div>

        {/* Desktop nav */}
        <nav className="d-none d-md-flex align-items-center gap-2">
          <NavLink className={navCls} to="/">Landing</NavLink>

          {authed ? (
            <>
              <NavLink className={navCls} to="/app">Асосӣ</NavLink>
              <NavLink className={navCls} to="/app/flashcards">Флешкортҳо</NavLink>
            </>
          ) : (
            <>
              <NavLink className={navCls} to="/login">Даромад</NavLink>
              <NavLink className={navCls} to="/register">Регистрация</NavLink>
            </>
          )}
        </nav>

        {/* Right: user + burger */}
        <div className="d-flex align-items-center gap-2">
          {authed && (
            <div className="d-none d-md-flex align-items-center gap-2">
              <div
                className="rounded-circle d-grid place-items-center"
                style={{
                  width: 38,
                  height: 38,
                  background: "rgba(15,23,42,.08)",
                  fontWeight: 900,
                }}
                title={user?.name || "User"}
              >
                {initials}
              </div>
              <button className="btn btn-soft rounded-4" onClick={doLogout}>
                Баромад
              </button>
            </div>
          )}

          {/* Burger (mobile) */}
          <button
            className="btn btn-soft rounded-4 d-md-none"
            onClick={() => setOpen(v => !v)}
            aria-label="Menu"
          >
            ☰
          </button>
        </div>
      </div>

      {/* Mobile menu drawer */}
      {open && (
        <div className="d-md-none">
          <div className="container pb-3">
            <div className="glass p-3">
              {authed && (
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <div className="d-flex align-items-center gap-2">
                    <div
                      className="rounded-circle d-grid place-items-center"
                      style={{ width: 40, height: 40, background: "rgba(15,23,42,.08)", fontWeight: 900 }}
                    >
                      {initials}
                    </div>
                    <div>
                      <div className="fw-bold">{user?.name || "User"}</div>
                      <div className="small text-secondary">{user?.email || ""}</div>
                    </div>
                  </div>
                  <button className="btn btn-soft rounded-4" onClick={doLogout}>Баромад</button>
                </div>
              )}

              <div className="d-grid gap-2">
                <Link className="btn btn-light rounded-4 text-start" to="/">Landing</Link>

                {authed ? (
                  <>
                    <Link className="btn btn-light rounded-4 text-start" to="/app">Асосӣ</Link>
                    <Link className="btn btn-light rounded-4 text-start" to="/app/flashcards">Флешкортҳо</Link>
                  </>
                ) : (
                  <>
                    <Link className="btn btn-light rounded-4 text-start" to="/login">Даромад</Link>
                    <Link className="btn btn-light rounded-4 text-start" to="/register">Регистрация</Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}