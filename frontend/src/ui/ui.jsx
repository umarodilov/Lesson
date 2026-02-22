import React from "react";

export function cn(...a) {
  return a.filter(Boolean).join(" ");
}

export function Card({ className = "", children }) {
  return (
    <div
      className={cn(
        "rounded-3xl bg-white/80 backdrop-blur border border-slate-200 shadow-[0_10px_30px_rgba(2,6,23,0.10)]",
        className
      )}
    >
      {children}
    </div>
  );
}

export function Button({ className = "", variant = "primary", ...props }) {
  const base =
    "inline-flex items-center justify-center rounded-2xl px-4 py-2 text-sm font-extrabold transition active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-blue-400/40";
  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700",
    soft: "bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-100",
    ghost: "bg-transparent hover:bg-slate-100 text-slate-800",
    danger: "bg-red-500 text-white hover:bg-red-600",
    success: "bg-emerald-500 text-white hover:bg-emerald-600",
    warning: "bg-amber-500 text-white hover:bg-amber-600",
  };
  return <button className={cn(base, variants[variant], className)} {...props} />;
}

export function ProgressBar({ value = 0 }) {
  return (
    <div className="h-3 w-full rounded-full bg-slate-200 overflow-hidden">
      <div
        className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-lime-500 to-amber-400 transition-[width] duration-300"
        style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
      />
    </div>
  );
}