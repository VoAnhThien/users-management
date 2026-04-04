// Dev + preview trên localhost: gọi /api → Vite proxy sang Render (tránh CORS).
// Build deploy domain khác: gọi thẳng BE (cần BE bật CORS + origin cụ thể nếu dùng credentials).
const useLocalProxy =
  import.meta.env.DEV ||
  (typeof window !== "undefined" &&
    (window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1"));
const BASE = useLocalProxy
  ? "/api"
  : "https://be-xdudweb.onrender.com/api";

// ─── User session (không có token, BE dùng session/cookie) ───────────────────
export const getUser   = () => { try { return JSON.parse(localStorage.getItem("user")); } catch { return null; } };
export const setUser   = (u) => localStorage.setItem("user", JSON.stringify(u));
export const clearUser = ()  => localStorage.removeItem("user");

// Dùng để check role: BE trả "ROLE_ADMIN" hoặc "ROLE_USER"
export const isAdmin = (user) =>
  user?.role === "ROLE_ADMIN" || user?.role === "admin";

export const getToken   = () => null;
export const setToken   = () => {};
export const clearToken = () => {};

const REQ_TIMEOUT_MS = 120_000;

async function req(path, options = {}) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), REQ_TIMEOUT_MS);
  let res;
  try {
    res = await fetch(`${BASE}${path}`, {
      credentials: "include",
      signal: ctrl.signal,
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
    });
  } catch (e) {
    if (e?.name === "AbortError") {
      throw new Error("Hết thời gian chờ server (Render có thể đang khởi động). Thử lại sau vài giây.");
    }
    throw e;
  } finally {
    clearTimeout(t);
  }

  // 401 trên login/register = sai tài khoản (cần báo lỗi), không phải hết session
  const isAuthAttempt =
    path === "/auth/login" || path === "/auth/register";
  if (res.status === 401 && !isAuthAttempt) {
    clearUser();
    window.location.reload();
  }

  const text = await res.text();
  let data;
  try { data = JSON.parse(text); } catch { data = text; }

  if (!res.ok) {
    const msg = data?.message || data?.error || `Lỗi ${res.status}`;
    throw new Error(msg);
  }
  return data;
}

// ─── Normalize list response ──────────────────────────────────────────────────
export function toList(data) {
  if (Array.isArray(data)) return data;
  if (data?.data && Array.isArray(data.data)) return data.data;
  // Spring Data Page / tương tự
  if (data?.content && Array.isArray(data.content)) return data.content;
  if (data?.students && Array.isArray(data.students)) return data.students;
  if (data?.items && Array.isArray(data.items)) return data.items;
  const arr = Object.values(data || {}).find(Array.isArray);
  return arr ?? [];
}

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const authAPI = {
  login:    (body) => req("/auth/login",    { method: "POST", body: JSON.stringify(body) }),
  register: (body) => req("/auth/register", { method: "POST", body: JSON.stringify(body) }),
};

// ─── Students ─────────────────────────────────────────────────────────────────
export const studentAPI = {
  getAll: ()      => req("/students"),
  create: (body)  => req("/students",      { method: "POST",   body: JSON.stringify(body) }),
  update: (id, b) => req(`/students/${id}`,{ method: "PUT",    body: JSON.stringify(b) }),
  remove: (id)    => req(`/students/${id}`,{ method: "DELETE" }),
};

// ─── Lớp ──────────────────────────────────────────────────────────────────────
export const lopAPI = {
  getAll:  ()      => req("/lops"),
  create:  (body)  => req("/lops",      { method: "POST",   body: JSON.stringify(body) }),
  update:  (id, b) => req(`/lops/${id}`,{ method: "PUT",    body: JSON.stringify(b) }),
  remove:  (id)    => req(`/lops/${id}`,{ method: "DELETE" }),
};

// ─── Môn Học ──────────────────────────────────────────────────────────────────
export const monHocAPI = {
  getAll:  ()      => req("/monhocs"),
  create:  (body)  => req("/monhocs",      { method: "POST",   body: JSON.stringify(body) }),
  update:  (id, b) => req(`/monhocs/${id}`,{ method: "PUT",    body: JSON.stringify(b) }),
  remove:  (id)    => req(`/monhocs/${id}`,{ method: "DELETE" }),
};

// ─── Điểm ─────────────────────────────────────────────────────────────────────
export const diemAPI = {
  getBySV: (mssv)                  => req(`/grades/student/${mssv}`),
  create:  (body)                  => req("/grades", { method: "POST", body: JSON.stringify(body) }),
  update:  (mssv, mamh, lan, body) => req(`/grades/${mssv}/${mamh}/${lan}`, { method: "PUT", body: JSON.stringify(body) }),
};