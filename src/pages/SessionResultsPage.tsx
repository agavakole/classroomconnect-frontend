// src/pages/SessionResultsPage.tsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { teacherApi } from "../services/api";

/**
 * Type for individual student submission row
 */
type Row = {
  id?: string;
  student_name?: string;
  student_full_name?: string;
  mood?: string;             // e.g., "energized"
  learning_style?: string;   // e.g., "visual", "active", "balanced"
  status?: string;           // "completed" | "skipped"
  created_at?: string;
};

/**
 * Returns color class for learning style badge
 * Provides visual distinction between different styles
 */
function styleColor(key: string) {
  const k = key.toLowerCase();
  if (k.includes("visual")) return "text-blue-600";
  if (k.includes("auditory")) return "text-purple-600";
  if (k.includes("kinesthetic")) return "text-emerald-600";
  if (k.includes("active")) return "text-emerald-600";
  if (k.includes("passive")) return "text-slate-700";
  if (k.includes("structured")) return "text-indigo-600";
  if (k.includes("balanced")) return "text-teal-600";
  return "text-gray-700";
}

/**
 * Returns emoji for learning style
 * Makes the dashboard more visual and engaging
 */
function styleEmoji(key: string) {
  const k = key.toLowerCase();
  if (k.includes("visual")) return "👁️";
  if (k.includes("auditory")) return "🎧";
  if (k.includes("kinesthetic")) return "✋";
  if (k.includes("active")) return "⚡";
  if (k.includes("passive")) return "📖";
  if (k.includes("structured")) return "📐";
  if (k.includes("balanced")) return "🎯";
  return "🎓";
}

/**
 * Returns badge styling classes for learning style
 */
function badgeClass(ls?: string) {
  const k = (ls || "").toLowerCase();
  if (k.includes("visual")) return "bg-blue-100 text-blue-700";
  if (k.includes("auditory")) return "bg-purple-100 text-purple-700";
  if (k.includes("kinesthetic")) return "bg-emerald-100 text-emerald-700";
  if (k.includes("active")) return "bg-emerald-100 text-emerald-700";
  if (k.includes("passive")) return "bg-slate-100 text-slate-700";
  if (k.includes("structured")) return "bg-indigo-100 text-indigo-700";
  if (k.includes("balanced")) return "bg-teal-100 text-teal-700";
  return "bg-gray-100 text-gray-700";
}

/**
 * Real-time session results dashboard
 * 
 * Features:
 * - Live-updating table of student submissions
 * - Summary statistics (total, breakdown by learning style)
 * - Auto-refresh every 6 seconds
 * - Shows mood, learning style, submission status
 * 
 * Backend connection:
 * - GET /api/sessions/{session_id}/submissions - Fetched repeatedly
 * 
 * Data flow:
 * 1. Student submits survey via POST /api/public/join/{token}/submit
 * 2. Backend calculates learning_style from survey responses
 * 3. Backend stores submission with mood, learning_style, student_name
 * 4. This page polls backend every 6s to show new submissions
 */
export default function SessionResultsPage() {
  const navigate = useNavigate();
  const { sessionId } = useParams<{ sessionId: string }>();

  const [rows, setRows] = useState<Row[]>([]); // All submissions
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [sessionInfo, setSessionInfo] = useState<{ require_survey?: boolean } | null>(null);

  /**
   * Effect: Load submissions and set up auto-refresh
   * Fetches data immediately, then every 6 seconds
   * 
   * Auto-refresh allows teacher to watch submissions arrive in real-time
   * as students join and complete surveys during class
   */
  useEffect(() => {
    let timer: number;

    const load = async () => {
      try {
        if (!sessionId) throw new Error("Missing sessionId");
        setErr("");

        // Backend: GET /api/sessions/{session_id}/submissions
        const data = await teacherApi.getSessionSubmissions(sessionId);
        const items = Array.isArray(data?.items) ? data.items : [];

        // Store session metadata if backend returns it
        if (data?.session) {
          setSessionInfo(data.session);
        }

        // Normalize submission data structure
        // Backend may use different field names, normalize to consistent format
        const normalized: Row[] = items.map((it: any) => ({
          id: it.id ?? undefined,
          student_name: it.student_full_name || it.student_name || "Guest",
          mood: (it.mood || "").toLowerCase(),
          learning_style: (it.learning_style || "").toLowerCase(),
          status: it.status || "completed",
          created_at: it.created_at,
        }));

        setRows(normalized);
      } catch (e: any) {
        const msg = String(e?.message || "");
        if (e?.status === 401 || msg.toLowerCase().includes("unauthorized")) {
          setErr("Not authorized. Please log in as a teacher again.");
        } else {
          setErr(msg || "Failed to load submissions.");
        }
      } finally {
        setLoading(false);
        // Schedule next refresh in 6 seconds
        timer = window.setTimeout(load, 6000);
      }
    };

    load(); // Initial load
    
    // Cleanup: cancel scheduled refresh when component unmounts
    return () => window.clearTimeout(timer);
  }, [sessionId]);

  /**
   * Calculates learning style distribution
   * Groups submissions by learning_style and counts each
   * Returns sorted array: most common styles first
   */
  const buckets = useMemo(() => {
    const map = new Map<string, number>();
    for (const r of rows) {
      const key = (r.learning_style || "not assessed").toLowerCase();
      map.set(key, (map.get(key) || 0) + 1);
    }
    return [...map.entries()].sort((a, b) => b[1] - a[1]); // Sort by count descending
  }, [rows]);

  // Show top 3 learning styles in summary tiles
  const topBuckets = buckets.slice(0, 3);

  /**
   * Formats ISO timestamp for display
   * Converts "2024-01-15T10:30:00Z" → "1/15/2024, 10:30:00 AM"
   */
  const fmt = (iso?: string) => (iso ? new Date(iso).toLocaleString() : "—");

  // Loading screen
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-blue-50">
        <div className="text-center">
          <div className="text-6xl mb-4">📊</div>
          <p className="text-2xl font-bold text-gray-700">Loading results…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50">
      {/* HEADER - navigation bar */}
      <header className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Session Results</h1>
            <p className="text-sm text-gray-500">
              Session ID: <code>{sessionId}</code>
            </p>
          </div>
          <div className="flex gap-2">
            {/* Manual refresh button */}
            <button
              onClick={() => window.location.reload()}
              className="px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200"
            >
              ↻ Refresh
            </button>
            {/* Back button */}
            <button
              onClick={() => navigate(-1)}
              className="px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200"
            >
              ← Back
            </button>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="max-w-6xl mx-auto px-4 py-6">
        {/* Error display */}
        {err && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 text-red-700 p-3">
            {err}
          </div>
        )}

        {/* INFO BANNER - shown when survey not required */}
        {sessionInfo?.require_survey === false && (
          <div className="mb-6 rounded-xl border-2 border-blue-200 bg-blue-50 p-4">
            <div className="flex gap-3">
              <span className="text-2xl">ℹ️</span>
              <div>
                <p className="font-semibold text-blue-900 mb-1">
                  Survey Not Required for This Session
                </p>
                <p className="text-blue-800 text-sm">
                  Students only provided their name and mood. Learning styles show as "Not Assessed" 
                  because no survey was completed. To get learning style data, create a new session 
                  with "Require baseline survey" checked.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* SUMMARY TILES - total submissions + top 3 learning styles */}
        <div className="grid sm:grid-cols-4 gap-3 mb-6">
          {/* Total tile */}
          <div className="p-4 bg-white rounded-xl shadow">
            <div className="text-sm text-gray-500">Total submissions</div>
            <div className="text-2xl font-bold">{rows.length}</div>
          </div>

          {/* Top 3 learning style tiles */}
          {topBuckets.map(([label, count]) => (
            <div key={label} className="p-4 bg-white rounded-xl shadow">
              <div className={`text-sm ${styleColor(label)} flex items-center gap-2`}>
                <span className="text-xl">{styleEmoji(label)}</span>
                <span className="capitalize">
                  {label === "" || label === "not assessed" ? "Not Assessed" : label}
                </span>
              </div>
              <div className={`text-2xl font-bold ${styleColor(label)} mt-1`}>
                {count}
              </div>
            </div>
          ))}

          {/* Padding tiles if fewer than 3 buckets exist */}
          {Array.from({ length: Math.max(0, 3 - topBuckets.length) }).map((_, i) => (
            <div key={`pad-${i}`} className="p-4 bg-white rounded-xl shadow opacity-40" />
          ))}
        </div>

        {/* SUBMISSIONS TABLE */}
        <div className="bg-white rounded-2xl shadow p-6">
          {rows.length === 0 ? (
            // Empty state
            <div className="text-gray-600">
              No submissions yet. Keep this page open; it auto-refreshes every 6 seconds.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="p-3 bg-gray-50 border-b text-left">Student</th>
                    <th className="p-3 bg-gray-50 border-b text-left">Mood</th>
                    <th className="p-3 bg-gray-50 border-b text-left">Learning Style</th>
                    <th className="p-3 bg-gray-50 border-b text-left">Status</th>
                    <th className="p-3 bg-gray-50 border-b text-left">Submitted At</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r, i) => {
                    const hasLearningStyle = r.learning_style && r.learning_style !== "" && r.learning_style !== "—";
                    
                    return (
                      <tr key={r.id || i}>
                        {/* Student name */}
                        <td className="p-3 border-b">{r.student_name || "Guest"}</td>
                        
                        {/* Mood */}
                        <td className="p-3 border-b capitalize">{r.mood || "—"}</td>
                        
                        {/* Learning style - badge or "Not Assessed" */}
                        <td className="p-3 border-b">
                          {hasLearningStyle ? (
                            <span className={`px-2 py-1 rounded text-sm ${badgeClass(r.learning_style)}`}>
                              {r.learning_style}
                            </span>
                          ) : (
                            <div className="flex items-center gap-2">
                              <span className="px-2 py-1 rounded text-sm bg-gray-100 text-gray-500 italic">
                                Not Assessed
                              </span>
                              {/* Info icon with tooltip */}
                              <span 
                                className="text-xs text-gray-400 cursor-help" 
                                title="Survey was not required for this session"
                              >
                                ⓘ
                              </span>
                            </div>
                          )}
                        </td>
                        
                        {/* Status */}
                        <td className="p-3 border-b capitalize">{r.status || "—"}</td>
                        
                        {/* Timestamp */}
                        <td className="p-3 border-b">{fmt(r.created_at)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Help text */}
        <div className="mt-4 text-sm text-gray-600 text-center">
          💡 This page auto-refreshes every 6 seconds to show new submissions in real-time.
        </div>
      </main>
    </div>
  );
}