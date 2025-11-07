// src/utils/activeSession.ts
export type ActiveSession = {
  session_id: string;
  join_token: string;
  course_id: string;
  require_survey: boolean;
  created_at: string;
  last_seen_at?: number;
};

const KEY = "active_session";

export function getActiveSession(): ActiveSession | null {
  try {
    // Prefer localStorage; fall back to sessionStorage for back-compat
    const raw = localStorage.getItem(KEY) ?? sessionStorage.getItem(KEY);
    if (!raw) return null;
    const obj = JSON.parse(raw) as ActiveSession;
    return obj?.session_id ? obj : null;
  } catch {
    return null;
  }
}

export function setActiveSession(s: ActiveSession) {
  try {
    const raw = JSON.stringify({ ...s, last_seen_at: Date.now() });
    localStorage.setItem(KEY, raw);
    // keep sessionStorage in sync too (optional)
    sessionStorage.setItem(KEY, raw);
  } catch {
    // no-op
  }
}

export function clearActiveSession() {
  localStorage.removeItem(KEY);
  sessionStorage.removeItem(KEY);
}
