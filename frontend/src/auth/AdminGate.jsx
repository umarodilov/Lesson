import React from "react";
import { Navigate } from "react-router-dom";
import { getUser, isAuthed } from "./auth";

export default function AdminGate({ children }) {
  if (!isAuthed()) return <Navigate to="/login" replace />;

  const user = getUser();
  if (user?.role !== "admin") return <Navigate to="/app" replace />;

  return children;
}