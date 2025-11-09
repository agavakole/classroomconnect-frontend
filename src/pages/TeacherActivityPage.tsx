import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { publicApi, authApi, teacherApi } from "../services/api";

type Activity = {
  id: string;
  name: string;
  type?: string;
  tags?: string[];
  summary?: string;
};

export default function TeacherActivitiesPage() {
  const [items, setItems] = useState<Activity[]>([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      try {
        setErr("");
        setLoading(true);
        // you already have teacherApi.getActivities(type?, tag?)
        const res = await teacherApi.getActivities();
        // backend may return {items} or array – normalize:
        const arr: Activity[] = Array.isArray(res) ? res : (res?.items ?? []);
        setItems(arr);
      } catch (e: any) {
        setErr(e?.message || "Failed to load activities.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = items.filter(a =>
    (a.name || "").toLowerCase().includes(q.toLowerCase()) ||
    (a.summary || "").toLowerCase().includes(q.toLowerCase()) ||
    (a.tags || []).some(t => t.toLowerCase().includes(q.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-[#F6F9FF] px-4 py-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-extrabold text-gray-900">Activities</h1>
          <Link
            to="/teacher/dashboard"
            className="px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200"
          >
            ← Back to dashboard
          </Link>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow flex items-center gap-3 mb-5">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by name, tag, or summary…"
            className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-200 focus:outline-none focus:border-[#0072FF]"
          />
        </div>

        {err && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 text-red-700 p-3">
            {err}
          </div>
        )}

        {loading ? (
          <div className="text-gray-600">Loading…</div>
        ) : filtered.length === 0 ? (
          <div className="text-gray-600">No activities found.</div>
        ) : (
          <ul className="grid md:grid-cols-2 gap-4">
            {filtered.map((a) => (
              <li key={a.id} className="bg-white rounded-2xl p-5 shadow border border-gray-100">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-lg font-semibold text-gray-900">{a.name}</div>
                    <div className="text-sm text-gray-500">{a.type ?? "activity"}</div>
                  </div>
                  <Link
                    to={`/teacher/activities/${a.id}`}
                    className="px-3 py-2 rounded-lg bg-black text-white text-sm"
                  >
                    View
                  </Link>
                </div>
                {a.summary && (
                  <p className="mt-3 text-gray-700 text-sm line-clamp-3">{a.summary}</p>
                )}
                {a.tags && a.tags.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {a.tags.map((t) => (
                      <span
                        key={t}
                        className="px-2 py-1 rounded-full text-xs bg-blue-50 text-blue-700"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
