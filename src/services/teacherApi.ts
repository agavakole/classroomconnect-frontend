const API_BASE = "http://localhost:8000/api";

// Return headers only if a token exists
const getAuthHeaders = (): Record<string, string> => {
  const token = localStorage.getItem("teacher_token");
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
};
// Helper to parse and throw with status attached
async function parseOrThrow(res: Response, label: string) {
  const text = await res.text();
  let json: any = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    /* ignore */
  }
  if (!res.ok) {
    const err: any = new Error(json?.detail ?? text ?? `${label} ${res.status}`);
    err.status = res.status;
    throw err;
  }
  return json;
}

export const teacherApi = {
  // ── Auth ─────────────────────────────────────────────────
  async login(email: string, password: string) {
    const res = await fetch(`${API_BASE}/teachers/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await parseOrThrow(res, "login");
    localStorage.setItem("teacher_token", data.access_token);
    return data;
  },

  async signup(email: string, password: string, full_name: string) {
    const res = await fetch(`${API_BASE}/teachers/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, full_name }),
    });
    return parseOrThrow(res, "signup");
  },

  logout() {
    localStorage.removeItem("teacher_token");
  },

  // ── Surveys ───────────────────────────────────────────────
  async getSurveys() {
    const res = await fetch(`${API_BASE}/surveys/`, { headers: getAuthHeaders() });
    return parseOrThrow(res, "getSurveys");
  },

  async createSurvey(surveyData: any) {
    const res = await fetch(`${API_BASE}/surveys/`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(surveyData),
    });
    return parseOrThrow(res, "createSurvey");
  },

  async getSurveyById(surveyId: string) {
    const res = await fetch(`${API_BASE}/surveys/${surveyId}`, { headers: getAuthHeaders() });
    return parseOrThrow(res, "getSurveyById");
  },

  // ── Activities ────────────────────────────────────────────
  async getActivities(type?: string, tag?: string) {
    const params = new URLSearchParams();
    if (type) params.append("type", type);
    if (tag) params.append("tag", tag);
    const url = `${API_BASE}/activities/${params.toString() ? `?${params}` : ""}`;
    const res = await fetch(url, { headers: getAuthHeaders() });
    return parseOrThrow(res, "getActivities");
  },

  async createActivity(activityData: any) {
    const res = await fetch(`${API_BASE}/activities/`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(activityData),
    });
    return parseOrThrow(res, "createActivity");
  },

  async getActivity(activityId: string) {
    const res = await fetch(`${API_BASE}/activities/${activityId}`, {
      headers: getAuthHeaders(),
    });
    return parseOrThrow(res, "getActivity");
  },

  async updateActivity(activityId: string, activityData: any) {
    const res = await fetch(`${API_BASE}/activities/${activityId}`, {
      method: "PATCH",
      headers: getAuthHeaders(),
      body: JSON.stringify(activityData),
    });
    return parseOrThrow(res, "updateActivity");
  },

  // ── Courses ───────────────────────────────────────────────
  async getCourses() {
    const res = await fetch(`${API_BASE}/courses/`, { headers: getAuthHeaders() });
    return parseOrThrow(res, "getCourses");
  },

  async createCourse(courseData: any) {
    const res = await fetch(`${API_BASE}/courses/`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(courseData),
    });
    return parseOrThrow(res, "createCourse");
  },

  async getCourse(courseId: string) {
    const res = await fetch(`${API_BASE}/courses/${courseId}`, { headers: getAuthHeaders() });
    return parseOrThrow(res, "getCourse");
  },

  async updateCourse(courseId: string, courseData: any) {
    const res = await fetch(`${API_BASE}/courses/${courseId}`, {
      method: "PATCH",
      headers: getAuthHeaders(),
      body: JSON.stringify(courseData),
    });
    return parseOrThrow(res, "updateCourse");
  },

  async getRecommendations(courseId: string) {
    const res = await fetch(`${API_BASE}/courses/${courseId}/recommendations`, {
      headers: getAuthHeaders(),
    });
    return parseOrThrow(res, "getRecommendations");
  },

  async updateRecommendations(courseId: string, mappings: any) {
    const res = await fetch(`${API_BASE}/courses/${courseId}/recommendations`, {
      method: "PATCH",
      headers: getAuthHeaders(),
      body: JSON.stringify({ mappings }),
    });
    return parseOrThrow(res, "updateRecommendations");
  },

  // ── Sessions ──────────────────────────────────────────────
  async createSession(courseId: string, requireSurvey = true) {
    const res = await fetch(`${API_BASE}/sessions/${courseId}/sessions`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ require_survey: requireSurvey }),
    });
    return parseOrThrow(res, "createSession");
  },

  async getSessionSubmissions(sessionId: string) {
    const res = await fetch(`${API_BASE}/sessions/${sessionId}/submissions`, {
      headers: getAuthHeaders(),
    });
    return parseOrThrow(res, "getSessionSubmissions");
  },
};
