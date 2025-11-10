// src/pages/StartSessionPage.tsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { QRCodeCanvas } from "qrcode.react";
import { teacherApi } from "../services/api";
import {
  getActiveSession,
  setActiveSession,
  clearActiveSession,
} from "../utils/activeSession";

/**
 * Type for session data returned by backend
 */
type CreatedSession = {
  session_id: string;
  join_token: string;
  require_survey: boolean;
  status: string;
};

/**
 * Full-page session management interface
 * 
 * Features:
 * - Start new session with join token
 * - Display QR code for students to scan
 * - Toggle survey requirement
 * - View real-time results
 * - End active session
 * 
 * Backend connections:
 * - POST /api/sessions/{course_id}/sessions - Start session
 * - POST /api/sessions/{session_id}/close - End session
 * - GET /api/sessions/{session_id}/submissions - View results (via navigate)
 * 
 * Navigation flows:
 * 1. From dashboard "Start Session" button → state.fromDashboard = true
 * 2. From course modal "Open Session View" → state.courseModalPath exists
 */
export default function StartSessionPage() {
  const { id: courseId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  // Session configuration
  const [requireSurvey, setRequireSurvey] = useState(true); // Whether students must complete survey
  const [session, setSession] = useState<CreatedSession | null>(null); // Active session data
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  /**
   * On mount: restore active session if it exists
   * Checks localStorage for session data (persists across page reloads)
   * This allows teacher to return to this page and see active session
   */
  useEffect(() => {
    const a = getActiveSession(); // Reads from localStorage: active_session
    if (a && a.course_id === courseId) {
      // Found matching active session
      setSession({
        session_id: a.session_id,
        join_token: a.join_token,
        require_survey: !!a.require_survey,
        status: "active",
      });
    }
  }, [courseId]);

  /**
   * Builds full join URL from token
   * Students use this to join session
   * Format: https://yourdomain.com/join/{joinToken}
   */
  const joinUrl = useMemo(() => {
    if (!session?.join_token) return "";
    return `${window.location.origin}/join/${session.join_token}`;
  }, [session?.join_token]);

  /**
   * Starts a new session for this course
   * Backend: POST /api/sessions/{course_id}/sessions
   * 
   * Returns:
   * - session_id: Unique identifier for this session
   * - join_token: Code/link students use to join
   * - require_survey: Whether survey is required
   * - status: "active"
   * 
   * Session remains active until teacher explicitly ends it
   * Join token becomes invalid after session ends
   */
  const handleStart = async () => {
    if (!courseId) return;
    try {
      setErr("");
      setLoading(true);
      const data = await teacherApi.createSession(courseId, requireSurvey);
      setSession(data);

      // Persist session data to localStorage
      // This allows teacher to navigate away and return
      // Also makes join token available to Home page for QR display
      setActiveSession({
        session_id: data.session_id,
        join_token: data.join_token,
        course_id: courseId,
        require_survey: data.require_survey,
        created_at: new Date().toISOString(),
      });
    } catch (e: any) {
      setErr(e?.message || "Failed to start session");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Ends the active session
   * Backend: POST /api/sessions/{session_id}/close
   * 
   * After ending:
   * - Students can no longer join (join_token becomes invalid)
   * - Students can no longer submit surveys
   * - Backend returns 410 (Gone) if join_token is used
   * 
   * Clears session from localStorage so it doesn't show as active
   */
  const handleEnd = async () => {
    if (!session?.session_id) return;
    
    // Confirmation prompt
    const confirmed = window.confirm(
      "Are you sure you want to end this session? Students will no longer be able to join or submit."
    );
    
    if (!confirmed) return;

    try {
      await teacherApi.endSession(session.session_id); // POST /close
      setSession(null); // Clear UI state
      clearActiveSession(); // Remove from localStorage
      alert("✅ Session ended successfully. Students can no longer join.");
    } catch (e: any) {
      alert("Failed to end session: " + (e?.message || "Unknown error"));
    }
  };

  /**
   * Navigates back to course modal or dashboard
   * 
   * Three scenarios handled:
   * 1. Came from course modal with backgroundLocation → reopen modal over dashboard
   * 2. Came from course modal without background → reopen modal, assume dashboard background
   * 3. Came from dashboard "Start Session" button → reopen course modal
   * 4. Fallback → go to dashboard
   */
  const handleBackToCourse = () => {
    const state = location.state as {
      fromDashboard?: boolean;
      courseId?: string;
      backgroundLocation?: Location;
      courseModalPath?: string;
    };

    // Scenario 1: From course modal with explicit background
    if (state?.courseModalPath && state?.backgroundLocation) {
      navigate(state.courseModalPath, { state: { backgroundLocation: state.backgroundLocation } });
      return;
    }

    // Scenario 2: From course modal but no background given (recent flow)
    if (state?.courseModalPath) {
      navigate(state.courseModalPath, { state: { backgroundLocation: { pathname: "/teacher/dashboard" } } });
      return;
    }

    // Scenario 3: Came directly from dashboard card
    if (state?.fromDashboard && state?.courseId) {
      navigate(`/teacher/courses/${state.courseId}`, {
        state: { backgroundLocation: { pathname: "/teacher/dashboard" } },
      });
      return;
    }

    // Scenario 4: Fallback
    navigate("/teacher/dashboard");
  };

  /**
   * Copies join link to clipboard
   * Teacher can share this link via Slack, email, etc.
   */
  const copyLink = async () => {
    if (!joinUrl) return;
    await navigator.clipboard.writeText(joinUrl);
    alert("Join link copied!");
  };

  return (
    <div className="min-h-screen bg-[#F7FAFF]">
      {/* HEADER - navigation bar */}
      <header className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Start Session — Course</h1>
          {/* Back button - returns to course modal or dashboard */}
          <button
            onClick={handleBackToCourse}
            className="px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200"
          >
            ← Course
          </button>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="max-w-6xl mx-auto p-6">
        {/* Error display */}
        {err && (
          <div className="mb-4 bg-red-50 text-red-700 border border-red-200 px-4 py-3 rounded-lg">
            {err}
          </div>
        )}

        {/* Two-column layout: controls on left, QR on right */}
        <div className="bg-white rounded-2xl shadow p-6 grid md:grid-cols-2 gap-8">
          
          {/* LEFT COLUMN - Session controls */}
          <div>
            {/* Survey requirement checkbox */}
            <label className="flex items-center gap-2 mb-4">
              <input
                type="checkbox"
                checked={requireSurvey}
                onChange={(e) => setRequireSurvey(e.target.checked)}
                disabled={!!session} // Can't change after session started
              />
              <span className="font-semibold">
                Require baseline survey during this session
              </span>
            </label>

            {/* Action buttons */}
            <div className="flex gap-3 mb-4 flex-wrap">
              {/* Start session button */}
              <button
                onClick={handleStart}
                disabled={loading || !!session}
                className="px-5 py-3 rounded-xl bg-black text-white font-semibold disabled:opacity-60"
              >
                {loading ? "Starting..." : session ? "✓ Session Active" : "▶ Start Session"}
              </button>

              {/* View results button - navigates to SessionResultsPage */}
              <button
                onClick={() =>
                  session?.session_id &&
                  navigate(`/teacher/sessions/${session.session_id}/results`)
                }
                disabled={!session}
                className="px-5 py-3 rounded-xl bg-gray-100 hover:bg-gray-200 disabled:opacity-60"
              >
                📊 View Results
              </button>

              {/* End session button */}
              <button
                onClick={handleEnd}
                disabled={!session}
                className="px-5 py-3 rounded-xl bg-rose-100 text-rose-700 hover:bg-rose-200 disabled:opacity-60"
              >
                ⛔ End Session
              </button>
            </div>

            {/* Join link display and actions */}
            <div className="mb-6">
              <div className="text-sm text-gray-600 mb-1">Join link</div>
              <div className="flex gap-2">
                {/* Read-only input showing join URL */}
                <input
                  readOnly
                  value={joinUrl || "— start a session to generate link —"}
                  className="flex-1 px-3 py-2 rounded-lg border"
                />
                {/* Copy button */}
                <button
                  onClick={copyLink}
                  disabled={!joinUrl}
                  className="px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-60"
                >
                  Copy
                </button>
                {/* Open in new tab button */}
                <a
                  href={joinUrl || "#"}
                  target="_blank"
                  rel="noreferrer"
                  className={`px-3 py-2 rounded-lg ${
                    joinUrl
                      ? "bg-gray-100 hover:bg-gray-200"
                      : "bg-gray-100 opacity-60 pointer-events-none"
                  }`}
                >
                  Open
                </a>
              </div>
            </div>

            {/* Session metadata */}
            {session && (
              <div className="space-y-2">
                <p className="text-sm text-gray-500">
                  Session ID:{" "}
                  <span className="font-mono">{session.session_id}</span>
                </p>
                {/* Active indicator with pulse animation */}
                {session.status === "active" && (
                  <div className="flex items-center gap-2 text-sm text-emerald-600">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                    <span className="font-semibold">Session is active</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* RIGHT COLUMN - QR Code display */}
          <div>
            <div className="text-sm text-gray-600 mb-2">QR Code</div>
            <div className="border rounded-xl p-4 flex items-center justify-center min-h-[300px]">
              {joinUrl ? (
                // Display QR code using qrcode.react library
                // Students scan this with phone camera to join
                <QRCodeCanvas value={joinUrl} size={260} includeMargin />
              ) : (
                // Placeholder when no session active
                <span className="text-gray-400">
                  Start a session to show QR
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Info box explaining the flow */}
        <div className="mt-6 bg-blue-50 text-blue-800 border border-blue-200 rounded-xl p-4">
          <div className="flex gap-2">
            <span className="text-xl">💡</span>
            <div>
              <p className="font-semibold mb-1">How it works</p>
              <p className="text-sm">
                Students scan the QR or open the join link. Logged-in students
                submit with their token; guests must provide a name.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}