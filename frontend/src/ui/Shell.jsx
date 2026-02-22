import React from "react";
import { NavLink } from "react-router-dom";

export default function Shell({ children }) {
  return (
    <div className="min-h-screen bg-[radial-gradient(1200px_600px_at_20%_0%,rgba(59,130,246,0.18),transparent),radial-gradient(900px_500px_at_80%_10%,rgba(14,165,233,0.14),transparent),linear-gradient(180deg,#f8fafc,#eef2ff)]">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/70 backdrop-blur">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="font-extrabold text-slate-900">
              Zaboni<span className="text-blue-600">Ru</span>
            </div>
            <div className="hidden sm:block text-xs text-slate-500">Омӯзиши русӣ барои тоҷикон</div>
          </div>

          <nav className="flex items-center gap-2">
            <Top to="/app" label="Асосӣ" />
            <Top to="/app/flashcards" label="Флешкортҳо" />
          </nav>

          <div className="h-9 w-9 rounded-full bg-slate-900/10 grid place-items-center font-extrabold text-slate-700">
            U
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-6">{children}</main>
    </div>
  );
}

function Top({ to, label }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        [
          "rounded-2xl px-3 py-2 text-sm font-extrabold transition",
          isActive ? "bg-blue-600 text-white" : "text-slate-700 hover:bg-slate-100",
        ].join(" ")
      }
    >
      {label}
    </NavLink>
  );
}