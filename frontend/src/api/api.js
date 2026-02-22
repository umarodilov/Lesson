import { getToken } from "../auth/auth";

const API = import.meta.env.VITE_API_URL;

async function request(path, { method = "GET", body, auth = false } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (auth) {
    const t = getToken();
    if (t) headers.Authorization = `Bearer ${t}`;
  }

  const r = await fetch(`${API}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await r.json().catch(() => ({}));
  if (!r.ok) {
    const msg = data?.message || "Request failed";
    throw new Error(msg);
  }
  return data;
}

// AUTH
export const apiRegister = (payload) => request("/api/auth/register", { method: "POST", body: payload });
export const apiLogin = (payload) => request("/api/auth/login", { method: "POST", body: payload });

// LESSONS
export const apiLessons = () => request("/api/lessons");
export const apiLesson = (id) => request(`/api/lessons/${id}`);

// CARDS
export const apiGenerateCards = (lessonId) =>
  request(`/api/lessons/${lessonId}/generate-cards`, { method: "POST", auth: true });

export const apiDueCards = (lessonId) =>
  request(`/api/flashcards?due=1${lessonId ? `&lessonId=${lessonId}` : ""}`, { auth: true });

export const apiReviewCard = (cardId, grade) =>
  request(`/api/flashcards/${cardId}/review`, { method: "POST", body: { grade }, auth: true });

// PROGRESS
export const apiGetProgress = () => request("/api/progress", { auth: true });
export const apiSaveProgress = (payload) => request("/api/progress", { method: "POST", body: payload, auth: true });

// ADMIN
export const apiAdminStats = () => request("/api/admin/stats", { auth: true });
export const apiAdminUsers = () => request("/api/admin/users", { auth: true });
export const apiAdminLessons = () => request("/api/admin/lessons", { auth: true });

// LESSONS admin CRUD (аллакай дар backend adminOnly аст)
export const apiCreateLesson = (payload) =>
  request("/api/lessons", { method: "POST", body: payload, auth: true });

export const apiUpdateLesson = (id, payload) =>
  request(`/api/lessons/${id}`, { method: "PUT", body: payload, auth: true });

export const apiDeleteLesson = (id) =>
  request(`/api/lessons/${id}`, { method: "DELETE", auth: true });