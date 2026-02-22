import React from "react";
import { Navigate } from "react-router-dom";
import { isAuthed } from "./auth";

export default function AuthGate({ children }) {
  if (!isAuthed()) return <Navigate to="/login" replace />;
  return children;
}