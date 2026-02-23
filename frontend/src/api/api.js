import { getToken } from "../auth/auth";

/* =====================================================
   API BASE URL (AUTO SAFE)
===================================================== */

const ENV_API = import.meta.env.VITE_API_URL;

const API =
  (ENV_API && ENV_API.trim()) ||
  (window.location.hostname === "localhost"
    ? "http://localhost:5000"
    : "https://lesson-back.onrender.com");

const BASE = API.replace(/\/+$/, "");

/* =====================================================
   CORE REQUEST
===================================================== */

async function request(path, { method = "GET", body, auth = false } = {}) {
  const headers = {
    "Content-Type": "application/json",
  };

  if (auth) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  let response;

  try {
    response = await fetch(`${BASE}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
      credentials: "include",
    });
  } catch (err) {
    throw new Error("Backend пайваст нест (Network error).");
  }

  let data = {};
  try {
    data = await response.json();
  } catch (_) {
    data = {};
  }

  if (!response.ok) {
    const msg =
      data?.message ||
      data?.error ||
      `Request failed (${response.status})`;
    throw new Error(msg);
  }

  return data;
}

/* =====================================================
   AUTH
===================================================== */

export const apiRegister = (payload) =>
  request("/api/auth/register", {
    method: "POST",
    body: payload,
  });

export const apiLogin = (payload) =>
  request("/api/auth/login", {
    method: "POST",
    body: payload,
  });

/* =====================================================
   LESSONS (PAGINATION SAFE 100%)
===================================================== */

export const apiLessons = async ({ page = 1, limit = 4 } = {}) => {
  const res = await request(`/api/lessons?page=${page}&limit=${limit}`);

  // 🟢 Case 1: Backend returns paginated object
  if (res && typeof res === "object" && Array.isArray(res.items)) {
    return {
      items: res.items,
      total: Number(res.total || 0),
      page: Number(res.page || page),
      limit: Number(res.limit || limit),
    };
  }

  // 🟢 Case 2: Backend returns plain array (old version)
  if (Array.isArray(res)) {
    return {
      items: res,
      total: res.length,
      page,
      limit,
    };
  }

  // 🟢 Fallback safe
  return {
    items: [],
    total: 0,
    page,
    limit,
  };
};

export const apiLesson = (id) =>
  request(`/api/lessons/${id}`);

/* =====================================================
   FLASHCARDS
===================================================== */

export const apiGenerateCards = (lessonId) =>
  request(`/api/lessons/${lessonId}/generate-cards`, {
    method: "POST",
    auth: true,
  });

export const apiDueCards = (lessonId) =>
  request(
    `/api/flashcards?due=1${lessonId ? `&lessonId=${lessonId}` : ""}`,
    { auth: true }
  );

export const apiReviewCard = (cardId, grade) =>
  request(`/api/flashcards/${cardId}/review`, {
    method: "POST",
    body: { grade },
    auth: true,
  });

/* =====================================================
   PROGRESS
===================================================== */

export const apiGetProgress = () =>
  request("/api/progress", { auth: true });

export const apiSaveProgress = (payload) =>
  request("/api/progress", {
    method: "POST",
    body: payload,
    auth: true,
  });

/* =====================================================
   ADMIN
===================================================== */

export const apiAdminStats = () =>
  request("/api/admin/stats", { auth: true });

export const apiAdminUsers = () =>
  request("/api/admin/users", { auth: true });

export const apiAdminLessons = () =>
  request("/api/admin/lessons", { auth: true });

export const apiCreateLesson = (payload) =>
  request("/api/lessons", {
    method: "POST",
    body: payload,
    auth: true,
  });

export const apiUpdateLesson = (id, payload) =>
  request(`/api/lessons/${id}`, {
    method: "PUT",
    body: payload,
    auth: true,
  });

export const apiDeleteLesson = (id) =>
  request(`/api/lessons/${id}`, {
    method: "DELETE",
    auth: true,
  });


export const apiLessonByOrder = (order) =>
  request(`/api/lessons/by-order/${order}`);