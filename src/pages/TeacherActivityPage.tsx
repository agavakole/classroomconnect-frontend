// src/pages/TeacherActivityPage.tsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { publicApi, authApi, teacherApi } from "../services/api";

/**
 * Type for activity list item
 */
type Activity = {
  id: string;
  name: string;
  type?: string;
  tags?: string[];
  summary?: string;
};

/**
 * Full-page activities browser
 * 
 * Features:
 * - List all teacher's activities
 * - Search/filter by name, tags, summary
 * - Click to view activity details (opens modal)
 * 
 * Backend connection:
 * - GET /api/activities/ - Fetch all activities
 * 
 * Accessed via dashboard or direct navigation
 * Provides comprehensive view for managing activity library
 */
export default function TeacherActivitiesPage() {
  const [items, setItems] = useState<Activity[]>([]);
  const [q, setQ] = useState(""); // Search query
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  /**
   * On mount: fetch all activities from backend
   */
  useEffect(() => {
    (async () => {
      try {
        setErr("");
        setLoading(true);
        // Backend: GET /api/activities/
        const res = await teacherApi.getActivities();
        
        // Backend may return array directly or wrapped in {items}
        const arr: Activity[] = Array.isArray(res) ? res : res?.items ?? [];
        setItems(arr);
      } catch (e: any) {
        setErr(e?.message || "Failed to load activities.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  /**
   * Client-side search filter
   * Searches across name, summary, and tags
   * Case-insensitive matching
   */
  const filtered = items.filter(
    (a) =>
      (a.name || "").toLowerCase().includes(q.toLowerCase()) ||
      (a.summary || "").toLowerCase().includes(q.toLowerCase()) ||
      (a.tags || []).some((t) => t.toLowerCase().includes(q.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-[#F6F9FF] px-4 py-8">
      <div className="max-w-5xl mx-auto">
        {/* HEADER - title and back button */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-extrabold text-gray-900">Activities</h1>
          <Link
            to="/teacher/dashboard"
            className="px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200"
          >
            ← Back to dashboard
          </Link>
        </div>

        {/* SEARCH BAR */}
        <div className="bg-white rounded-2xl p-4 shadow flex items-center gap-3 mb-5">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by name, tag, or summary…"
            className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-200 focus:outline-none focus:border-[#0072FF]"
          />
        </div>

        {/* ERROR DISPLAY */}
        {err && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 text-red-700 p-3">
            {err}
          </div>
        )}

        {/* LOADING STATE */}
        {loading ? (
          <div className="text-gray-600">Loading…</div>
        ) : filtered.length === 0 ? (
          // EMPTY STATE
          <div className="text-gray-600">No activities found.</div>
        ) : (
          // ACTIVITIES GRID
          <ul className="grid md:grid-cols-2 gap-4">
            {filtered.map((a) => (
              <li
                key={a.id}
                className="bg-white rounded-2xl p-5 shadow border border-gray-100"
              >
                <div className="flex items-start justify-between">
                  <div>
                    {/* Activity name */}
                    <div className="text-lg font-semibold text-gray-900">
                      {a.name}
                    </div>
                    {/* Activity type */}
                    <div className="text-sm text-gray-500">
                      {a.type ?? "activity"}
                    </div>
                  </div>
                  
                  {/* View button - opens modal with returnTo state */}
                  <Link
                    to={`/teacher/activities/${a.id}`}
                    state={{ returnTo: "/teacher/dashboard" }}
                    className="px-3 py-2 rounded-lg bg-black text-white text-sm"
                  >
                    View
                  </Link>
                </div>
                
                {/* Summary */}
                {a.summary && (
                  <p className="mt-3 text-gray-700 text-sm line-clamp-3">
                    {a.summary}
                  </p>
                )}
                
                {/* Tags */}
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