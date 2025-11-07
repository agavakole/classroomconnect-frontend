import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { teacherApi } from "../services/teacherApi";

type Submission = {
  id?: string;
  student_name?: string;
  mood?: string;
  learning_style?: string;   // normalize to string
  created_at?: string;
};

const norm = (v?: string) => (v ? String(v).toLowerCase() : "");

export default function SessionResultsPage() {
  const navigate = useNavigate();
  const { sessionId } = useParams<{ sessionId: string }>();

  const [rows, setRows] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string>("");

  useEffect(() => {
    let timer: number;

    const load = async () => {
      try {
        if (!sessionId) throw new Error("Missing sessionId");
        setErr("");

        const data = await teacherApi.getSessionSubmissions(sessionId);

        // API may return either { submissions: [...] } or bare array. Normalize:
        const list: any[] = Array.isArray(data?.submissions)
          ? data.submissions
          : Array.isArray(data)
          ? data
          : [];

        const normalized: Submission[] = list.map((r) => ({
          id: r.id ?? r.submission_id ?? undefined,
          student_name: r.student_name ?? r.name ?? "Guest",
          mood: r.mood ?? r.mood_label ?? undefined,
          learning_style:
            r.learning_style ??
            r.learning_style_label ??
            r.learningStyle ??
            undefined,
          created_at: r.created_at ?? r.submitted_at ?? r.timestamp ?? undefined,
        }));

        setRows(normalized);
      } catch (e: any) {
        const msg = String(e?.message || "");
        if (msg.includes("401") || msg.toLowerCase().includes("unauthorized")) {
          setErr("Not authorized. Please log in as a teacher again.");
        } else {
          setErr(msg || "Failed to load submissions.");
        }
      } finally {
        setLoading(false);
        timer = window.setTimeout(load, 6000);
      }
    };

    load();
    return () => window.clearTimeout(timer);
  }, [sessionId]);

  const totals = useMemo(() => {
    const count = (k: string) =>
      rows.filter((r) => norm(r.learning_style) === k).length;
    return {
      total: rows.length,
      visual: count("visual"),
      auditory: count("auditory"),
      kinesthetic: count("kinesthetic"),
    };
  }, [rows]);

  const badge = (ls?: string) => {
    const x = norm(ls);
    return x === "visual"
      ? "bg-blue-100 text-blue-700"
      : x === "auditory"
      ? "bg-purple-100 text-purple-700"
      : x === "kinesthetic"
      ? "bg-emerald-100 text-emerald-700"
      : "bg-gray-100 text-gray-700";
  };

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

        {/* Summary tiles */}
        <div className="grid sm:grid-cols-4 gap-3 mb-6">
          <div className="p-4 bg-white rounded-xl shadow">
            <div className="text-sm text-gray-500">Total submissions</div>
            <div className="text-2xl font-bold">{totals.total}</div>
          </div>
          <div className="p-4 bg-white rounded-xl shadow">
            <div className="text-sm text-gray-500">Visual</div>
            <div className="text-2xl font-bold text-blue-600">
              {totals.visual}
            </div>
          </div>
          <div className="p-4 bg-white rounded-xl shadow">
            <div className="text-sm text-gray-500">Auditory</div>
            <div className="text-2xl font-bold text-purple-600">
              {totals.auditory}
            </div>
          </div>
          <div className="p-4 bg-white rounded-xl shadow">
            <div className="text-sm text-gray-500">Kinesthetic</div>
            <div className="text-2xl font-bold text-emerald-600">
              {totals.kinesthetic}
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow p-6">
          {rows.length === 0 ? (
            <div className="text-gray-600">
              No submissions yet. Keep this page open; it auto-refreshes every 6
              seconds.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="p-3 bg-gray-50 border-b text-left">Student</th>
                    <th className="p-3 bg-gray-50 border-b text-left">Mood</th>
                    <th className="p-3 bg-gray-50 border-b text-left">
                      Learning Style
                    </th>
                    <th className="p-3 bg-gray-50 border-b text-left">
                      Submitted At
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r, i) => (
                    <tr key={r.id || i}>
                      <td className="p-3 border-b">{r.student_name || "Guest"}</td>
                      <td className="p-3 border-b capitalize">{r.mood || "—"}</td>
                      <td className="p-3 border-b">
                        <span
                          className={`px-2 py-1 rounded text-sm ${badge(
                            r.learning_style
                          )}`}
                        >
                          {r.learning_style || "—"}
                        </span>
                      </td>
                      <td className="p-3 border-b">{fmt(r.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
