// src/auth.ts
export const STUDENT_TOKEN_KEY = "student_token";

// Any keys that make App think there's an active join session
const SESSION_KEYS = ["session", "guest_name", "student_full_name"];

export function getStudentToken(): string | null {
  return localStorage.getItem(STUDENT_TOKEN_KEY);
}

export function setStudentToken(token: string) {
  localStorage.setItem(STUDENT_TOKEN_KEY, token);
}

// Clear only the student token
export function clearStudentToken() {
  localStorage.removeItem(STUDENT_TOKEN_KEY);
}

// Clear any cached join-session state so App won't route to Welcome
export function clearJoinSessionState() {
  SESSION_KEYS.forEach((k) => sessionStorage.removeItem(k));
}

// Convenience: full student logout → clear token + clear session cache
export function logoutStudentCompletely() {
  clearStudentToken();
  clearJoinSessionState();
}
