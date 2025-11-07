// src/auth.ts
export const STUDENT_TOKEN_KEY = "student_token";

export function getStudentToken(): string | null {
  return localStorage.getItem(STUDENT_TOKEN_KEY);
}

export function setStudentToken(token: string) {
  localStorage.setItem(STUDENT_TOKEN_KEY, token);
}

export function clearStudentToken() {
  localStorage.removeItem(STUDENT_TOKEN_KEY);
}
