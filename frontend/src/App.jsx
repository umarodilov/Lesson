import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import AuthGate from "./auth/AuthGate.jsx";
import AdminGate from "./auth/AdminGate.jsx";

import Landing from "./pages/Landing.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";

import Dashboard from "./pages/Dashboard.jsx";
import Lesson from "./pages/Lesson.jsx";
import Flashcards from "./pages/Flashcards.jsx";

import AdminDashboard from "./pages/admin/AdminDashboard.jsx";
import AdminLessons from "./pages/admin/AdminLessons.jsx";
import AdminUsers from "./pages/admin/AdminUsers.jsx";
import AdminSettings from "./pages/admin/AdminSettings.jsx";

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* User App */}
      <Route
        path="/app"
        element={
          <AuthGate>
            <Dashboard />
          </AuthGate>
        }
      />
      <Route
        path="/app/lesson/:id"
        element={
          <AuthGate>
            <Lesson />
          </AuthGate>
        }
      />
      <Route
        path="/app/flashcards"
        element={
          <AuthGate>
            <Flashcards />
          </AuthGate>
        }
      />

      {/* Admin App (nested routes) */}
      <Route
        path="/admin"
        element={
          <AdminGate>
            <AdminDashboard />
          </AdminGate>
        }
      />
      <Route
        path="/admin/lessons"
        element={
          <AdminGate>
            <AdminLessons />
          </AdminGate>
        }
      />
      <Route
        path="/admin/users"
        element={
          <AdminGate>
            <AdminUsers />
          </AdminGate>
        }
      />
      <Route
        path="/admin/settings"
        element={
          <AdminGate>
            <AdminSettings />
          </AdminGate>
        }
      />

      {/* If someone types wrong admin url */}
      <Route path="/admin/*" element={<Navigate to="/admin" replace />} />

      {/* Not found */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}