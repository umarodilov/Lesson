const KEY = "lesson_token";
const UKEY = "lesson_user";

export function saveAuth(token, user) {
  localStorage.setItem(KEY, token);
  localStorage.setItem(UKEY, JSON.stringify(user || null));
}

export function getToken() {
  return localStorage.getItem(KEY) || "";
}

export function getUser() {
  const raw = localStorage.getItem(UKEY);
  try { return raw ? JSON.parse(raw) : null; } catch { return null; }
}

export function logout() {
  localStorage.removeItem(KEY);
  localStorage.removeItem(UKEY);
}

export function isAuthed() {
  return !!getToken();
}