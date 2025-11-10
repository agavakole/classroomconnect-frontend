import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { teacherApi } from "../services/api";

type Row = {
  id?: string;
  student_name?: string;
  student_full_name?: string;
  mood?: string;             // e.g., "energized"
  learning_style?: string;   // arbitrary label from backend (e.g., "visual", "active learner", etc.)
  status?: string;           // "completed" | "skipped"
  created_at?: string;
};

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

export default function SessionResultsPage() {
  const navigate = useNavigate();
  const { sessionId } = useParams<{ sessionId: string }>();

  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [sessionInfo, setSessionInfo] = useState<{ require_survey?: boolean } | null>(null);

  useEffect(() => {
    let timer: number;

    const load = async () => {
      try {
        if (!sessionId) throw new Error("Missing sessionId");
        setErr("");

        const data = await teacherApi.getSessionSubmissions(sessionId);
        const items = Array.isArray(data?.items) ? data.items : [];

        // Try to get session info (if your backend returns it)
        // You might need to add a separate endpoint: teacherApi.getSession(sessionId)
        if (data?.session) {
          setSessionInfo(data.session);
        }

        const normalized: Row[] = items.map((it: any) => ({
          id: it.id ?? undefined,
          student_name: it.student_full_name || it.student_name || "Guest",
          mood: (it.mood || "").toLowerCase(),
          learning_style: (it.learning_style || "").toLowerCase(), // keep lowercase for grouping; display will be capitalized
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
        // auto-refresh every 6s so teachers can watch results roll in live
        timer = window.setTimeout(load, 6000);
      }
    };

    load();
    return () => window.clearTimeout(timer);
  }, [sessionId]);

  // Dynamic buckets based on whatever labels backend sends
  const buckets = useMemo(() => {
    const map = new Map<string, number>();
    for (const r of rows) {
      const key = (r.learning_style || "not assessed").toLowerCase();
      map.set(key, (map.get(key) || 0) + 1);
    }
    return [...map.entries()].sort((a, b) => b[1] - a[1]); // sorted by count desc
  }, [rows]);

  const topBuckets = buckets.slice(0, 3); // show top 3 after "Total"

  const fmt = (iso?: string) => (iso ? new Date(iso).toLocaleString() : "—");

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
      <header className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Session Results</h1>
            <p className="text-sm text-gray-500">
              Session ID: <code>{sessionId}</code>
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => window.location.reload()}
              className="px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200"
            >
              ↻ Refresh
            </button>
            <button
              onClick={() => navigate(-1)}
              className="px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200"
            >
              ← Back
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        {err && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 text-red-700 p-3">
            {err}
          </div>
        )}

        {/* Info banner about survey requirement */}
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

        {/* Summary tiles: total + top 3 style buckets */}
        <div className="grid sm:grid-cols-4 gap-3 mb-6">
          <div className="p-4 bg-white rounded-xl shadow">
            <div className="text-sm text-gray-500">Total submissions</div>
            <div className="text-2xl font-bold">{rows.length}</div>
          </div>

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

          {/* If fewer than 3 buckets, fill the grid for consistent layout */}
          {Array.from({ length: Math.max(0, 3 - topBuckets.length) }).map((_, i) => (
            <div key={`pad-${i}`} className="p-4 bg-white rounded-xl shadow opacity-40" />
          ))}
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow p-6">
          {rows.length === 0 ? (
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
                        <td className="p-3 border-b">{r.student_name || "Guest"}</td>
                        <td className="p-3 border-b capitalize">{r.mood || "—"}</td>
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
                              <span 
                                className="text-xs text-gray-400 cursor-help" 
                                title="Survey was not required for this session"
                              >
                                ⓘ
                              </span>
                            </div>
                          )}
                        </td>
                        <td className="p-3 border-b capitalize">{r.status || "—"}</td>
                        <td className="p-3 border-b">{fmt(r.created_at)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Help text at bottom */}
        <div className="mt-4 text-sm text-gray-600 text-center">
          💡 This page auto-refreshes every 6 seconds to show new submissions in real-time.
        </div>
      </main>
    </div>
  );
}