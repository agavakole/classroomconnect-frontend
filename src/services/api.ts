// src/services/api.ts

/* =========================================================
 * Base URL Configuration
 * =======================================================*/
// Backend API base URL from environment variable or defaults to localhost
// The replace() removes any trailing slashes for consistent URL construction
const API_BASE_URL =
  import.meta.env?.VITE_API_BASE_URL?.replace(/\/+$/, "") || "http://localhost:8000";

/* =========================================================
 * Authentication Token Management
 * These functions handle storing/retrieving JWT tokens in browser storage
 * =======================================================*/

// Saves student JWT token to localStorage after successful login
// Backend issues this via POST /api/students/login
export const saveStudentToken = (t: string) => localStorage.setItem("student_token", t);

// Saves teacher JWT token to localStorage after successful login
// Backend issues this via POST /api/teachers/login
export const saveTeacherToken = (t: string) => localStorage.setItem("teacher_token", t);

// Removes both student and teacher tokens (full logout)
export const clearAllAuth = () => {
  localStorage.removeItem("student_token");
  localStorage.removeItem("teacher_token");
};

// Retrieves student token for authenticated API calls
export const getStudentToken = () => localStorage.getItem("student_token");

// Retrieves teacher token for authenticated API calls
export const getTeacherToken = () => localStorage.getItem("teacher_token");

/* Convenience boolean checks for authentication status */
export const isStudentAuthed = () => !!getStudentToken();
export const isTeacherAuthed = () => !!getTeacherToken();

/* =========================================================
 * Response Parsing Helpers
 * Handle both JSON and text responses from backend
 * =======================================================*/

/**
 * Attempts to parse response as JSON, falls back to text
 * Returns both parsed JSON (if successful) and raw text
 * Needed because some errors return HTML instead of JSON
 */
async function parseOrText(res: Response): Promise<{ json: any; text: string }> {
  const text = await res.text();
  try {
    return { json: text ? JSON.parse(text) : null, text };
  } catch {
    return { json: null, text }; // Parse failed, return raw text
  }
}

/**
 * Creates and throws a structured error with HTTP status code
 * Attaches status to error object so callers can handle specific codes (401, 403, etc.)
 */
function fail(res: Response, msg: string): never {
  const err: any = new Error(msg);
  err.status = res.status;
  err.code = msg;
  throw err;
}

/**
 * Checks if an error indicates a closed/ended session
 * Used to show appropriate UI when students try joining ended sessions
 * Backend returns 410 (Gone) or 403 (Forbidden) for ended sessions
 */
export function isSessionEndedError(e: any): boolean {
  const msg = String(e?.message || e?.code || "");
  return e?.status === 410 || e?.status === 403 || /SESSION_ENDED/i.test(msg);
}

/* =========================================================
 * HTTP Headers Construction
 * =======================================================*/
type HeaderRecord = Record<string, string>;

// Adds Authorization header with Bearer token if provided
const withAuth = (token?: string | null): HeaderRecord =>
  token ? { Authorization: `Bearer ${token}` } : {};

// Converts various header formats to plain object
const toHeaderRecord = (h?: HeadersInit): HeaderRecord => {
  if (!h) return {};
  if (h instanceof Headers) return Object.fromEntries(h.entries());
  if (Array.isArray(h)) return Object.fromEntries(h);
  return { ...h };
};

/* =========================================================
 * Core Request Wrapper
 * Centralized fetch function that handles auth, errors, parsing
 * =======================================================*/
type RequestOpts = RequestInit & { token?: string | null; acceptJson?: boolean };

/**
 * Makes HTTP request to backend with automatic:
 * - JWT token attachment (if provided)
 * - JSON parsing
 * - Error handling for session ended (410/403)
 * - Cookie handling (credentials: include)
 * 
 * @param url - Full API endpoint URL
 * @param opts - Fetch options plus custom token/acceptJson
 * @returns Parsed JSON response
 * @throws Error with status code attached
 */
async function request(url: string, opts: RequestOpts = {}) {
  const { token, acceptJson = true, headers, ...rest } = opts;

  // Build headers: JSON content type + auth token + custom headers
  const base: HeaderRecord = {
    ...(acceptJson ? { Accept: "application/json" } : {}),
    "Content-Type": "application/json",
    ...withAuth(token),
  };
  const merged: HeaderRecord = { ...base, ...toHeaderRecord(headers) };

  // Make the actual HTTP request
  const res = await fetch(url, {
    ...rest,
    headers: merged as HeadersInit,
    credentials: rest.credentials ?? "include", // Send cookies
  });

  // Special handling for session ended errors (backend returns 410/403)
  if (res.status === 410 || res.status === 403) {
    const { json, text } = await parseOrText(res);
    fail(res, json?.detail || text || "SESSION_ENDED");
  }

  // Parse response and throw on error status codes
  const { json, text } = await parseOrText(res);
  if (!res.ok) fail(res, json?.detail ?? text ?? `HTTP_${res.status}`);
  return json;
}

/* =========================================================
 * PUBLIC API (No Authentication Required)
 * Used by students joining sessions via QR/link
 * =======================================================*/
export const publicApi = {
  /**
   * Resolves a join token to get session details
   * Backend: GET /api/public/join/{joinToken}
   * Returns: { session: { session_id, require_survey, survey, mood_check_schema, status }, ... }
   * 
   * Checks if session is still active (status === "active")
   * Throws SESSION_ENDED error if session is closed/ended
   */
  async getSession(joinToken: string) {
    const data = await request(`${API_BASE_URL}/api/public/join/${joinToken}`, {
      method: "GET",
    });

    // Validate session is still accepting submissions
    const status = data?.session?.status?.toLowerCase?.();
    if (status && status !== "active") {
      const e: any = new Error("SESSION_ENDED");
      e.status = 410;
      e.code = "SESSION_ENDED";
      throw e;
    }
    return data;
  },

  /**
   * Submits student's survey responses and mood to backend
   * Backend: POST /api/public/join/{joinToken}/submit
   * 
   * Handles two scenarios:
   * 1. Logged-in student: sends with auth token, is_guest=false
   * 2. Guest student: sends without token, is_guest=true, requires student_name
   * 
   * If auth fails (401/TypeError), retries as guest submission
   * 
   * @param joinToken - Session join token
   * @param data - Survey submission payload
   * @param authToken - Optional student JWT token
   * @returns Backend response with learning_style, mood, recommended_activity
   */
  async submitSurvey(
    joinToken: string,
    data: {
      mood: string;
      answers: Record<string, string>; // question_id -> option_id mapping
      is_guest: boolean;
      student_name?: string;
      guest_id?: string;
    },
    authToken?: string
  ) {
    try {
      // Try with auth token first (for logged-in students)
      return await request(`${API_BASE_URL}/api/public/join/${joinToken}/submit`, {
        method: "POST",
        body: JSON.stringify(data),
        token: authToken,
      });
    } catch (e: any) {
      // If auth fails, retry as guest submission (fallback for expired tokens)
      if (authToken && (e?.status === 401 || e?.name === "TypeError")) {
        return await request(`${API_BASE_URL}/api/public/join/${joinToken}/submit`, {
          method: "POST",
          body: JSON.stringify(data),
          token: null, // No auth token
        });
      }
      throw e;
    }
  },
};

/* =========================================================
 * AUTH API (Student & Teacher Authentication)
 * Handles signup, login, profile fetching
 * =======================================================*/
export const authApi = {
  /* ----- STUDENT AUTHENTICATION ----- */
  
  /**
   * Creates new student account
   * Backend: POST /api/students/signup
   * Returns: Success message or validation errors
   */
  studentSignup(email: string, password: string, fullName: string) {
    return request(`${API_BASE_URL}/api/students/signup`, {
      method: "POST",
      body: JSON.stringify({ email, password, full_name: fullName }),
    });
  },

  /**
   * Authenticates student and receives JWT token
   * Backend: POST /api/students/login
   * Automatically saves token to localStorage for future requests
   * 
   * @returns { access_token: string, token_type: "bearer" }
   */
  async studentLogin(email: string, password: string) {
    const json = await request(`${API_BASE_URL}/api/students/login`, {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    saveStudentToken(json.access_token); // Store for future API calls
    return json as { access_token: string; token_type: "bearer" };
  },

  /**
   * Fetches authenticated student's profile data
   * Backend: GET /api/students/me (requires Bearer token)
   * Used to display name, email in StudentHome page
   */
  getStudentProfile(token: string) {
    return request(`${API_BASE_URL}/api/students/me`, {
      method: "GET",
      token,
    }) as Promise<{ id: string; email: string; full_name: string; created_at: string }>;
  },

  /**
   * Gets student's submission history
   * Backend: GET /api/students/submissions (requires Bearer token)
   * Shows past surveys completed, moods, learning styles
   */
  getStudentSubmissions(token: string) {
    return request(`${API_BASE_URL}/api/students/submissions`, {
      method: "GET",
      token,
    }) as Promise<{ submissions: any[]; total: number }>;
  },

  /* ----- TEACHER AUTHENTICATION ----- */
  
  /**
   * Creates new teacher account
   * Backend: POST /api/teachers/signup
   */
  teacherSignup(email: string, password: string, fullName: string) {
    return request(`${API_BASE_URL}/api/teachers/signup`, {
      method: "POST",
      body: JSON.stringify({ email, password, full_name: fullName }),
    });
  },

  /**
   * Authenticates teacher and receives JWT token
   * Backend: POST /api/teachers/login
   * Automatically saves token to localStorage
   */
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
 * TEACHER DASHBOARD API
 * CRUD operations for surveys, activities, courses, sessions
 * All endpoints require teacher authentication (Bearer token)
 * =======================================================*/
const API_BASE = `${API_BASE_URL}/api`;
const teacherToken = () => getTeacherToken(); // Helper to get current teacher token

export const teacherApi = {
  /**
   * Logs out teacher by removing token from localStorage
   * Frontend-only operation, no backend call needed
   */
  logout() {
    localStorage.removeItem("teacher_token");
  },

  /* ----- SURVEYS ----- */
  
  /**
   * Fetches all surveys created by authenticated teacher
   * Backend: GET /api/surveys/
   * Returns array of survey objects with questions
   */
  getSurveys() {
    return request(`${API_BASE}/surveys/`, { method: "GET", token: teacherToken() });
  },

  /**
   * Creates new survey with questions and scoring
   * Backend: POST /api/surveys/
   * 
   * @param surveyData - { title, questions: [{ text, options: [{ label, scores }] }] }
   * Questions must have visual/auditory/kinesthetic scores for learning style calculation
   */
  createSurvey(surveyData: any) {
    return request(`${API_BASE}/surveys/`, {
      method: "POST",
      token: teacherToken(),
      body: JSON.stringify(surveyData),
    });
  },

  /**
   * Fetches single survey by ID
   * Backend: GET /api/surveys/{surveyId}
   * Used in TeacherSurveyDetail modal to display questions
   */
  getSurveyById(surveyId: string) {
    return request(`${API_BASE}/surveys/${surveyId}`, {
      method: "GET",
      token: teacherToken(),
    });
  },

  /* ----- ACTIVITIES ----- */
  
  /**
   * Fetches all activities with optional filtering
   * Backend: GET /api/activities/?type={type}&tag={tag}
   * 
   * @param type - Filter by activity type (video, worksheet, etc.)
   * @param tag - Filter by tag (visual, auditory, etc.)
   */
  getActivities(type?: string, tag?: string) {
    const params = new URLSearchParams();
    if (type) params.append("type", String(type));
    if (tag) params.append("tag", String(tag));
    const url = `${API_BASE}/activities/${params.toString() ? `?${params}` : ""}`;
    return request(url, { method: "GET", token: teacherToken() });
  },

  /**
   * Creates new activity (video, worksheet, in-class task, etc.)
   * Backend: POST /api/activities/
   * 
   * @param activityData - { name, summary, type, tags, content_json }
   * content_json structure varies by type (url for video, steps for tasks, etc.)
   */
  createActivity(activityData: any) {
    return request(`${API_BASE}/activities/`, {
      method: "POST",
      token: teacherToken(),
      body: JSON.stringify(activityData),
    });
  },

  /**
   * Fetches single activity by ID
   * Backend: GET /api/activities/{activityId}
   * Used in TeacherActivityDetail modal to show activity content
   */
  getActivity(activityId: string) {
    return request(`${API_BASE}/activities/${activityId}`, {
      method: "GET",
      token: teacherToken(),
    });
  },

  /**
   * Updates existing activity
   * Backend: PATCH /api/activities/{activityId}
   * Used to edit activity details, content, tags
   */
  updateActivity(activityId: string, activityData: any) {
    return request(`${API_BASE}/activities/${activityId}`, {
      method: "PATCH",
      token: teacherToken(),
      body: JSON.stringify(activityData),
    });
  },

  /* ----- COURSES ----- */
  
  /**
   * Fetches all courses created by teacher
   * Backend: GET /api/courses/
   * Returns courses with surveys, mood labels, learning style categories
   */
  getCourses() {
    return request(`${API_BASE}/courses/`, { method: "GET", token: teacherToken() });
  },

  /**
   * Creates new course with survey assignment
   * Backend: POST /api/courses/
   * 
   * @param courseData - { title, baseline_survey_id, mood_labels }
   * Mood labels determine which moods students can select
   */
  createCourse(courseData: any) {
    return request(`${API_BASE}/courses/`, {
      method: "POST",
      token: teacherToken(),
      body: JSON.stringify(courseData),
    });
  },

  /**
   * Fetches single course by ID
   * Backend: GET /api/courses/{courseId}
   * Returns course details including survey and mood labels
   */
  getCourse(courseId: string) {
    return request(`${API_BASE}/courses/${courseId}`, {
      method: "GET",
      token: teacherToken(),
    });
  },

  /**
   * Updates course details
   * Backend: PATCH /api/courses/{courseId}
   * Can update title, survey, mood labels
   */
  updateCourse(courseId: string, courseData: any) {
    return request(`${API_BASE}/courses/${courseId}`, {
      method: "PATCH",
      token: teacherToken(),
      body: JSON.stringify(courseData),
    });
  },

  /* ----- COURSE RECOMMENDATIONS ----- */
  
  /**
   * Gets activity recommendations for course
   * Backend: GET /api/courses/{courseId}/recommendations
   * Returns mappings: { learning_style, mood, activity_id }
   * 
   * These mappings determine which activity shows for each student
   * based on their survey results (learning style) and selected mood
   */
  getRecommendations(courseId: string) {
    return request(`${API_BASE}/courses/${courseId}/recommendations`, {
      method: "GET",
      token: teacherToken(),
    });
  },

  /**
   * Updates activity recommendations for course
   * Backend: PATCH /api/courses/{courseId}/recommendations
   * 
   * @param mappings - Array of { learning_style, mood, activity_id }
   * Example: visual + energized → Activity A, auditory + tired → Activity B
   */
  updateRecommendations(courseId: string, mappings: any) {
    return request(`${API_BASE}/courses/${courseId}/recommendations`, {
      method: "PATCH",
      token: teacherToken(),
      body: JSON.stringify({ mappings }),
    });
  },

  /* ----- SESSIONS ----- */

  /**
   * Creates and starts a new session for a course
   * Backend: POST /api/sessions/{course_id}/sessions
   * 
   * @param requireSurvey - Whether students must complete survey to join
   * @returns { session_id, join_token, require_survey, status: "active" }
   * 
   * join_token is used by students to join (via QR or link)
   * Session remains active until teacher explicitly ends it
   */
  createSession(courseId: string, requireSurvey = true) {
    return request(`${API_BASE}/sessions/${courseId}/sessions`, {
      method: "POST",
      token: teacherToken(),
      body: JSON.stringify({ require_survey: requireSurvey }),
    });
  },

  /**
   * Fetches all student submissions for a session
   * Backend: GET /api/sessions/{session_id}/submissions
   * 
   * Returns array of submissions with:
   * - student_name, mood, learning_style, status, created_at
   * 
   * Used in SessionResultsPage to show real-time results
   * Auto-refreshes every 6 seconds to show new submissions
   */
  async getSessionSubmissions(sessionId: string) {
    return request(`${API_BASE}/sessions/${sessionId}/submissions`, {
      method: "GET",
      token: teacherToken(),
    });
  },

  /**
   * Ends/closes an active session
   * Backend: POST /api/sessions/{session_id}/close
   * 
   * After closing, students can no longer join or submit
   * Join token becomes invalid, returns 410 error if attempted
   */
  endSession(sessionId: string) {
    return request(`${API_BASE}/sessions/${sessionId}/close`, {
      method: "POST",
      token: teacherToken(),
    });
  },
};