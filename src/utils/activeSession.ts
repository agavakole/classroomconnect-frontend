// src/utils/activeSession.ts

/**
 * Type definition for active session data
 * Stored in localStorage when teacher starts a session
 * Used to display QR codes and track active sessions
 */
export type ActiveSession = {
  session_id: string;      // Unique session identifier from backend
  join_token: string;      // Token students use to join (e.g., "7F9K2A")
  course_id: string;       // Associated course ID
  require_survey: boolean; // Whether survey is mandatory
  created_at: string;      // ISO timestamp when session started
  last_seen_at?: number;   // Last time this session was accessed (for cleanup)
};

/**
 * localStorage key for active session data
 * Persists across page reloads and browser tabs
 */
const KEY = "active_session";

/**
 * Retrieves the currently active session from storage
 * 
 * Checks both localStorage (primary) and sessionStorage (fallback)
 * Used by:
 * - Home page to display QR code
 * - StartSessionPage to restore session on reload
 * - TeacherCourseDetail to show active session banner
 * 
 * @returns Active session object or null if none exists
 */
export function getActiveSession(): ActiveSession | null {
  try {
    // Prefer localStorage (persists across tabs/reloads)
    // Fall back to sessionStorage for backward compatibility
    const raw = localStorage.getItem(KEY) ?? sessionStorage.getItem(KEY);
    if (!raw) return null;
    
    // Parse and validate JSON
    const obj = JSON.parse(raw) as ActiveSession;
    
    // Ensure required fields exist
    return obj?.session_id ? obj : null;
  } catch {
    // Invalid JSON or other error
    return null;
  }
}

/**
 * Stores active session data
 * 
 * Called when:
 * - Teacher starts a new session (POST /api/sessions/{course_id}/sessions)
 * - Session data is updated
 * 
 * Stores in both localStorage and sessionStorage for maximum compatibility
 * localStorage allows QR to persist across tabs/reloads
 * sessionStorage provides fallback for older code
 * 
 * @param s - Active session object to store
 */
export function setActiveSession(s: ActiveSession) {
  try {
    // Add timestamp for future cleanup logic
    const raw = JSON.stringify({ ...s, last_seen_at: Date.now() });
    
    // Store in both locations
    localStorage.setItem(KEY, raw);
    sessionStorage.setItem(KEY, raw); // Keep in sync (optional)
  } catch {
    // Storage quota exceeded or other error - fail silently
  }
}

/**
 * Clears active session data
 * 
 * Called when:
 * - Teacher ends session (POST /api/sessions/{session_id}/close)
 * - Session expires or becomes invalid
 * 
 * Removes from both localStorage and sessionStorage
 * This hides QR codes from Home page and updates UI across all tabs
 */
export function clearActiveSession() {
  localStorage.removeItem(KEY);
  sessionStorage.removeItem(KEY);
}