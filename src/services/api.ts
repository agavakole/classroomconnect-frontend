// src/services/api.ts

// ============================================
// 🌐 BASE URL
// ============================================
const API_BASE_URL =
  import.meta.env?.VITE_API_BASE_URL ?? "http://localhost:8000";

// ============================================
// 🔧 Small helpers
// ============================================
const saveStudentToken = (t: string) => {
  localStorage.setItem("student_token", t);
  // being a student means not a teacher session right now:
  localStorage.removeItem("teacher_token");
};
const saveTeacherToken = (t: string) => {
  localStorage.setItem("teacher_token", t);
  localStorage.removeItem("student_token");
};
export const clearAllAuth = () => {
  localStorage.removeItem("student_token");
  localStorage.removeItem("teacher_token");
};
const authHeader = (token: string) => ({ Authorization: `Bearer ${token}` });

async function parseOrText(res: Response) {
  const text = await res.text();
  try {
    return { json: JSON.parse(text), text };
  } catch {
    return { json: null, text };
  }
}

function throwWithStatus(res: Response, msg: string) {
  const err: any = new Error(msg);
  err.status = res.status;
  throw err;
}

// ============================================
// 🎯 PUBLIC API (no login)
// ============================================
export const publicApi = {
  // GET /api/public/join/{join_token}
   async getSession(joinToken: string) {
    const res = await fetch(`${API_BASE_URL}/api/public/join/${joinToken}`, {
      credentials: "include", // ← send cookies if backend sets any
      headers: { Accept: "application/json" },
    });
    const { json, text } = await parseOrText(res);
    if (!res.ok) throw new Error(json?.detail ?? text ?? `getSession ${res.status}`);
    return json;
  },

  // Works for guests and logged-in students.
  async submitSurvey(
    joinToken: string,
    data: {
      mood: string;
      answers: Record<string, string>;
      is_guest: boolean;
      student_name?: string;
      guest_id?: string;
    },
    authToken?: string
  ) {
    const send = async (withAuth: boolean) => {
      const res = await fetch(`${API_BASE_URL}/api/public/join/${joinToken}/submit`, {
        method: "POST",
        credentials: "include", // ← helps with CSRF/session cookies if used
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          ...(withAuth && authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        },
        body: JSON.stringify(data),
      });
      const { json, text } = await parseOrText(res);
      if (!res.ok) {
        throwWithStatus(res, json?.detail ?? text ?? `submit ${res.status}`);
      }
      return json;
    };

    if (authToken) {
      try {
        return await send(true);   // try with Authorization
      } catch (e: any) {
        // If the auth header triggers a 401 or a CORS network error in dev,
        // retry without it so guests/unauth flows still work.
        if (e?.status === 401 || e?.name === "TypeError") {
          return await send(false);
        }
        throw e;
      }
    }
    return await send(false);
  },
};
// ============================================
// 🔐 AUTHENTICATED API
// ============================================
export const authApi = {
  // ── STUDENT ────────────────────────────────
  async studentSignup(email: string, password: string, fullName: string) {
    const res = await fetch(`${API_BASE_URL}/api/students/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, full_name: fullName }),
    });
    const { json, text } = await parseOrText(res);
    if (!res.ok) throw new Error(json?.detail ?? text ?? `SIGNUP_FAILED ${res.status}`);
    return json as { id: string; email: string; full_name: string };
  },

  async studentLogin(email: string, password: string) {
    const res = await fetch(`${API_BASE_URL}/api/students/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const { json, text } = await parseOrText(res);
    if (!res.ok) {
      throw new Error(json?.detail ?? "AUTH_INVALID_CREDENTIALS");
    }
    localStorage.setItem("student_token", json.access_token);
    localStorage.removeItem("teacher_token");
    return json as { access_token: string; token_type: "bearer" };
  },

  async getStudentProfile(token: string) {
    const res = await fetch(`${API_BASE_URL}/api/students/me`, {
      headers: { "Content-Type": "application/json", ...authHeader(token) },
    });
    const { json, text } = await parseOrText(res);
    if (!res.ok) throw new Error(json?.detail ?? text ?? `PROFILE_FAILED ${res.status}`);
    return json as { id: string; email: string; full_name: string; created_at: string };
  },

  async getStudentSubmissions(token: string) {
    const res = await fetch(`${API_BASE_URL}/api/students/submissions`, {
      headers: { "Content-Type": "application/json", ...authHeader(token) },
    });
    const { json, text } = await parseOrText(res);
    if (!res.ok) throw new Error(json?.detail ?? text ?? `SUBMISSIONS_FAILED ${res.status}`);
    return json as { submissions: any[]; total: number };
  },

  // ✅ NEW: Authenticated submit for a joined session
  
  // ── TEACHER ────────────────────────────────
  async teacherSignup(email: string, password: string, fullName: string) {
    const res = await fetch(`${API_BASE_URL}/api/teachers/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, full_name: fullName }),
    });
    const { json, text } = await parseOrText(res);
    if (!res.ok) throw new Error(json?.detail ?? text ?? `SIGNUP_FAILED ${res.status}`);
    return json as { id: string; email: string; full_name: string };
  },

  async teacherLogin(email: string, password: string) {
    const res = await fetch(`${API_BASE_URL}/api/teachers/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const { json, text } = await parseOrText(res);
    if (!res.ok) throw new Error(json?.detail ?? text ?? `AUTH_INVALID_CREDENTIALS`);
    localStorage.setItem("teacher_token", json.access_token);
    localStorage.removeItem("student_token");
    return json as { access_token: string; token_type: "bearer" };
  },
};