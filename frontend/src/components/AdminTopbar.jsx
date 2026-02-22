import React, { useEffect, useMemo, useState } from "react";
import { NavLink, Link, useLocation, useNavigate } from "react-router-dom";
import { getUser, logout } from "../auth/auth";
import { getInitials } from "../utils/name";

export default function AdminTopbar() {
  const nav = useNavigate();
  const loc = useLocation();
  const user = getUser();

  const initials = useMemo(() => getInitials(user?.name || "Admin"), [user?.name]);

  const [open, setOpen] = useState(false);

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
        <div className="d-flex align-items-center gap-3">
          <Link to="/admin" className="text-decoration-none">
            <div className="brand fs-5">Admin<span>Panel</span></div>
          </Link>
          <span className="badge badge-soft rounded-pill px-3 py-2 d-none d-md-inline">
            {user?.email || ""}
          </span>
        </div>

        {/* Desktop nav */}
        <nav className="d-none d-md-flex align-items-center gap-2">
          <NavLink className={navCls} to="/admin">Dashboard</NavLink>
          <NavLink className={navCls} to="/admin/lessons">Lessons</NavLink>
          <NavLink className={navCls} to="/admin/users">Users</NavLink>
          <NavLink className={navCls} to="/admin/settings">Settings</NavLink>
        </nav>

        <div className="d-flex align-items-center gap-2">
          <div className="d-none d-md-flex align-items-center gap-2">
            <div
              className="rounded-circle d-grid place-items-center"
              style={{ width: 38, height: 38, background: "rgba(15,23,42,.08)", fontWeight: 900 }}
              title={user?.name || "Admin"}
            >
              {initials}
            </div>
            <button className="btn btn-soft rounded-4" onClick={doLogout}>Баромад</button>
          </div>

          <button className="btn btn-soft rounded-4 d-md-none" onClick={() => setOpen(v => !v)} aria-label="Menu">
            ☰
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="d-md-none">
          <div className="container pb-3">
            <div className="glass p-3">
              <div className="d-flex align-items-center justify-content-between mb-2">
                <div className="d-flex align-items-center gap-2">
                  <div
                    className="rounded-circle d-grid place-items-center"
                    style={{ width: 40, height: 40, background: "rgba(15,23,42,.08)", fontWeight: 900 }}
                  >
                    {initials}
                  </div>
                  <div>
                    <div className="fw-bold">{user?.name || "Admin"}</div>
                    <div className="small text-secondary">{user?.email || ""}</div>
                  </div>
                </div>
                <button className="btn btn-soft rounded-4" onClick={doLogout}>Баромад</button>
              </div>

              <div className="d-grid gap-2">
                <Link className="btn btn-light rounded-4 text-start" to="/admin">Dashboard</Link>
                <Link className="btn btn-light rounded-4 text-start" to="/admin/lessons">Lessons</Link>
                <Link className="btn btn-light rounded-4 text-start" to="/admin/users">Users</Link>
                <Link className="btn btn-light rounded-4 text-start" to="/admin/settings">Settings</Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}