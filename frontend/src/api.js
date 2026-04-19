
const BASE = "https://be-xdudweb.onrender.com/api";

export const getUser   = () => { try { return JSON.parse(localStorage.getItem("user")); } catch { return null; } };
export const setUser   = (u) => localStorage.setItem("user", JSON.stringify(u));
export const clearUser = ()  => localStorage.removeItem("user");

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
  getProfile: ()  => req("/students/profile"),
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

// ─── Chuyển Lớp ───────────────────────────────────────────────────────────────
export const transferAPI = {
  submit:     (body) => req("/transfer/submit",  { method: "POST", body: JSON.stringify(body) }),
  getPending: ()     => req("/transfer/pending"),
  approve:    (id)   => req(`/transfer/approve/${id}`, { method: "PUT" }),
};