// src/auth.ts

// Key used to store the student's authentication token in browser localStorage
export const STUDENT_TOKEN_KEY = "student_token";

// Array of sessionStorage keys that indicate an active join session is in progress
// These are checked to determine if a student is mid-way through joining a course
const SESSION_KEYS = ["session", "guest_name", "student_full_name"];

/**
 * Retrieves the student's JWT authentication token from localStorage
 * Returns null if no token exists (student not logged in)
 * This token is sent with API requests to authenticate the student
 */
export function getStudentToken(): string | null {
  return localStorage.getItem(STUDENT_TOKEN_KEY);
}

/**
 * Saves the student's JWT token to localStorage after successful login
 * This persists across browser sessions until explicitly cleared
 * Backend issues this token via /api/students/login endpoint
 */
export function setStudentToken(token: string) {
  localStorage.setItem(STUDENT_TOKEN_KEY, token);
}

/**
 * Removes only the student authentication token from localStorage
 * Used during logout but doesn't clear session-specific data
 * Student must re-login to get a new token from backend
 */
export function clearStudentToken() {
  localStorage.removeItem(STUDENT_TOKEN_KEY);
}

/**
 * Clears all temporary session data from sessionStorage
 * Prevents App.tsx from routing to Welcome/Survey screens
 * after student has finished or abandoned a join session
 */
export function clearJoinSessionState() {
  SESSION_KEYS.forEach((k) => sessionStorage.removeItem(k));
}

/**
 * Complete logout: removes both auth token AND session state
 * Called when student explicitly logs out or session ends
 * Ensures clean slate for next login/join attempt
 */
export function logoutStudentCompletely() {
  clearStudentToken();
  clearJoinSessionState();
}