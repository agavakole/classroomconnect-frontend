// src/services/api.ts

/* =========================================================
 * Base URL
 * =======================================================*/
const API_BASE_URL =
  import.meta.env?.VITE_API_BASE_URL?.replace(/\/+$/, "") || "http://localhost:8000";

/* =========================================================
 * Small auth helpers
 * =======================================================*/
export const saveStudentToken = (t: string) => localStorage.setItem("student_token", t);
export const saveTeacherToken = (t: string) => localStorage.setItem("teacher_token", t);
export const clearAllAuth = () => {
  localStorage.removeItem("student_token");
  localStorage.removeItem("teacher_token");
};
export const getStudentToken = () => localStorage.getItem("student_token");
export const getTeacherToken = () => localStorage.getItem("teacher_token");

/* (Optional) convenience flags for your pages */
export const isStudentAuthed = () => !!getStudentToken();
export const isTeacherAuthed = () => !!getTeacherToken();

/* =========================================================
 * Response helpers
 * =======================================================*/
async function parseOrText(res: Response): Promise<{ json: any; text: string }> {
  const text = await res.text();
  try {
    return { json: text ? JSON.parse(text) : null, text };
  } catch {
    return { json: null, text };
  }
}
function fail(res: Response, msg: string): never {
  const err: any = new Error(msg);
  err.status = res.status;
  throw err;
}

/* =========================================================
 * Headers helpers (TS-safe)
 * =======================================================*/
type HeaderRecord = Record<string, string>;
const withAuth = (token?: string | null): HeaderRecord =>
  token ? { Authorization: `Bearer ${token}` } : {};
const toHeaderRecord = (h?: HeadersInit): HeaderRecord => {
  if (!h) return {};
  if (h instanceof Headers) {
    const out: HeaderRecord = {};
    h.forEach((v, k) => (out[k] = v));
    return out;
  }
  if (Array.isArray(h)) return Object.fromEntries(h);
  return { ...h };
};

/* =========================================================
 * Single request wrapper
 * =======================================================*/
type RequestOpts = RequestInit & { token?: string | null; acceptJson?: boolean };

async function request(url: string, opts: RequestOpts = {}) {
  const { token, acceptJson = true, headers, ...rest } = opts;

  const base: HeaderRecord = {
    ...(acceptJson ? { Accept: "application/json" } : {}),
    "Content-Type": "application/json",
    ...withAuth(token),
  };
  const merged: HeaderRecord = { ...base, ...toHeaderRecord(headers) };

  const res = await fetch(url, {
    ...rest,
    headers: merged as HeadersInit,
    credentials: rest.credentials ?? "include",
  });

  const { json, text } = await parseOrText(res);
  if (!res.ok) fail(res, json?.detail ?? text ?? `HTTP_${res.status}`);
  return json;
}

/* =========================================================
 * PUBLIC (no-auth)
 * =======================================================*/
export const publicApi = {
  getSession(joinToken: string) {
    return request(`${API_BASE_URL}/api/public/join/${joinToken}`, { method: "GET" });
  },

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
    try {
      return await request(`${API_BASE_URL}/api/public/join/${joinToken}/submit`, {
        method: "POST",
        body: JSON.stringify(data),
        token: authToken,
      });
    } catch (e: any) {
      if (authToken && (e?.status === 401 || e?.name === "TypeError")) {
        // retry without auth header in dev
        return await request(`${API_BASE_URL}/api/public/join/${joinToken}/submit`, {
          method: "POST",
          body: JSON.stringify(data),
          token: null,
        });
      }
      throw e;
    }
  },
};

/* =========================================================
 * AUTH (students + teachers)
 * =======================================================*/
export const authApi = {
  /* ----- STUDENT ----- */
  studentSignup(email: string, password: string, fullName: string) {
    return request(`${API_BASE_URL}/api/students/signup`, {
      method: "POST",
      body: JSON.stringify({ email, password, full_name: fullName }),
    });
  },

  async studentLogin(email: string, password: string) {
    const json = await request(`${API_BASE_URL}/api/students/login`, {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    saveStudentToken(json.access_token);
    return json as { access_token: string; token_type: "bearer" };
  },

  getStudentProfile(token: string) {
    return request(`${API_BASE_URL}/api/students/me`, { method: "GET", token }) as Promise<{
      id: string;
      email: string;
      full_name: string;
      created_at: string;
    }>;
  },

  getStudentSubmissions(token: string) {
    return request(`${API_BASE_URL}/api/students/submissions`, {
      method: "GET",
      token,
    }) as Promise<{ submissions: any[]; total: number }>;
  },

  /* ----- TEACHER ----- */
  teacherSignup(email: string, password: string, fullName: string) {
    return request(`${API_BASE_URL}/api/teachers/signup`, {
      method: "POST",
      body: JSON.stringify({ email, password, full_name: fullName }),
    });
  },

  async teacherLogin(email: string, password: string) {
    const json = await request(`${API_BASE_URL}/api/teachers/login`, {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    saveTeacherToken(json.access_token);
    return json as { access_token: string; token_type: "bearer" };
  },
};

/* =========================================================
 * TEACHER dashboard API
 * =======================================================*/
const API_BASE = `${API_BASE_URL}/api`;
const teacherToken = () => getTeacherToken();

export const teacherApi = {
  logout() {
    localStorage.removeItem("teacher_token");
  },

  /* Surveys */
  getSurveys() {
    return request(`${API_BASE}/surveys/`, { method: "GET", token: teacherToken() });
  },
  createSurvey(surveyData: any) {
    return request(`${API_BASE}/surveys/`, {
      method: "POST",
      token: teacherToken(),
      body: JSON.stringify(surveyData),
    });
  },
  getSurveyById(surveyId: string) {
    return request(`${API_BASE}/surveys/${surveyId}`, {
      method: "GET",
      token: teacherToken(),
    });
  },

  /* Activities */
  getActivities(type?: string, tag?: string) {
    const params = new URLSearchParams();
    if (type) params.append("type", String(type));
    if (tag) params.append("tag", String(tag));
    const url = `${API_BASE}/activities/${params.toString() ? `?${params}` : ""}`;
    return request(url, { method: "GET", token: teacherToken() });
  },
  createActivity(activityData: any) {
    return request(`${API_BASE}/activities/`, {
      method: "POST",
      token: teacherToken(),
      body: JSON.stringify(activityData),
    });
  },
  getActivity(activityId: string) {
    return request(`${API_BASE}/activities/${activityId}`, {
      method: "GET",
      token: teacherToken(),
    });
  },
  updateActivity(activityId: string, activityData: any) {
    return request(`${API_BASE}/activities/${activityId}`, {
      method: "PATCH",
      token: teacherToken(),
      body: JSON.stringify(activityData),
    });
  },

  /* Courses */
  getCourses() {
    return request(`${API_BASE}/courses/`, { method: "GET", token: teacherToken() });
  },
  createCourse(courseData: any) {
    return request(`${API_BASE}/courses/`, {
      method: "POST",
      token: teacherToken(),
      body: JSON.stringify(courseData),
    });
  },
  getCourse(courseId: string) {
    return request(`${API_BASE}/courses/${courseId}`, {
      method: "GET",
      token: teacherToken(),
    });
  },
  updateCourse(courseId: string, courseData: any) {
    return request(`${API_BASE}/courses/${courseId}`, {
      method: "PATCH",
      token: teacherToken(),
      body: JSON.stringify(courseData),
    });
  },

  /* Course Recommendations */
  getRecommendations(courseId: string) {
    return request(`${API_BASE}/courses/${courseId}/recommendations`, {
      method: "GET",
      token: teacherToken(),
    });
  },
  updateRecommendations(courseId: string, mappings: any) {
    return request(`${API_BASE}/courses/${courseId}/recommendations`, {
      method: "PATCH",
      token: teacherToken(),
      body: JSON.stringify({ mappings }),
    });
  },

  /* Sessions */
  createSession(courseId: string, requireSurvey = true) {
    // keep your existing route shape
    return request(`${API_BASE}/sessions/${courseId}/sessions`, {
      method: "POST",
      token: teacherToken(),
      body: JSON.stringify({ require_survey: requireSurvey }),
    });
  },

  // NOTE: this endpoint is TEACHER-ONLY. Call it only when a teacher token exists.
  async getSessionSubmissions(sessionId: string) {
    const t = teacherToken();
    if (!t) {
      // prevent accidental student calls that cause 403 spam
      throw new Error("TEACHER_AUTH_REQUIRED");
    }
    const res = await fetch(`${API_BASE_URL}/api/sessions/${sessionId}/submissions`, {
      method: "GET",
      headers: { Accept: "application/json", ...withAuth(t) },
      credentials: "include",
    });
    const { json, text } = await parseOrText(res);
    if (!res.ok) fail(res, json?.detail ?? text ?? "SUBMISSIONS_FAILED");
    return json;
  },
};
