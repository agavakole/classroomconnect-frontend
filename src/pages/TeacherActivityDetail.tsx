import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { publicApi, authApi, teacherApi } from "../services/api";

export default function TeacherActivityDetail() {
  const { id } = useParams<{ id: string }>();
  const [item, setItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      if (!id) return;
      try {
        setErr("");
        setLoading(true);
        const data = await teacherApi.getActivities(id);
        setItem(data);
      } catch (e: any) {
        setErr(e?.message || "Failed to load activity.");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  return (
    <div className="min-h-screen bg-[#F6F9FF] px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-extrabold text-gray-900">Activity</h1>
          <div className="flex gap-2">
            <Link
              to="/teacher/activities"
              className="px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200"
            >
              ← All activities
            </Link>
            <Link
              to="/teacher/dashboard"
              className="px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200"
            >
              Dashboard
            </Link>
          </div>
        </div>

        {err && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 text-red-700 p-3">
            {err}
          </div>
        )}

        {loading ? (
          <div className="text-gray-600">Loading…</div>
        ) : !item ? (
          <div className="text-gray-600">Not found.</div>
        ) : (
          <div className="bg-white rounded-2xl p-6 shadow border border-gray-100">
            <div className="text-2xl font-bold text-gray-900">{item.name}</div>
            {item.type && <div className="text-sm text-gray-500">{item.type}</div>}

            {item.summary && <p className="mt-3 text-gray-700">{item.summary}</p>}

            {item.tags?.length ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {item.tags.map((t: string) => (
                  <span key={t} className="px-2 py-1 rounded-full text-xs bg-blue-50 text-blue-700">
                    {t}
                  </span>
                ))}
              </div>
            ) : null}

            {/* Optional JSON preview */}
            {item.content_json && (
              <details className="mt-5">
                <summary className="cursor-pointer font-semibold">Content JSON</summary>
                <pre className="mt-2 p-3 bg-gray-50 rounded-xl overflow-auto text-sm">
                  {JSON.stringify(item.content_json, null, 2)}
                </pre>
              </details>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
