// src/pages/StudentHome.tsx
import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { authApi } from "../services/api";
import { getStudentToken, clearStudentToken } from "../auth";

export default function StudentHome() {
  const nav = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [subs, setSubs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getStudentToken();
    if (!token) {
      nav("/student/login", { replace: true });
      return;
    }
    (async () => {
      try {
        const [p, h] = await Promise.all([
          authApi.getStudentProfile(token),
          authApi.getStudentSubmissions(token),
        ]);
        setProfile(p);
        setSubs(h?.submissions || []);
      } finally {
        setLoading(false);
      }
    })();
  }, [nav]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#E6F6FF]">
        <div className="text-center">
          <div className="text-6xl mb-4">⏳</div>
          <p className="text-2xl font-bold text-gray-700">
            Loading your dashboard…
          </p>
        </div>
      </div>
    );
  }

  const logout = () => {
    clearStudentToken();
    // leave teacher token alone; this is student logout
    nav("/", { replace: true });
  };

  return (
    <div className="min-h-screen bg-[#E6F6FF] px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-extrabold text-gray-900">
            Welcome back{profile?.full_name ? `, ${profile.full_name}` : ""}! ✨
          </h1>
          <div className="flex gap-2">
            <Link
              to="/join"
              className="px-4 py-2 rounded-lg bg-cyan-500 text-white hover:bg-cyan-600"
            >
              Join a Session
            </Link>
            <button
              onClick={logout}
              className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300"
            >
              Logout
            </button>
          </div>
        </div>

        {/* profile card */}
        <div className="bg-white rounded-2xl p-6 shadow mb-8">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-gray-500">Email</div>
              <div className="font-semibold">{profile?.email ?? "—"}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Member since</div>
              <div className="font-semibold">
                {profile?.created_at
                  ? new Date(profile.created_at).toLocaleDateString()
                  : "—"}
              </div>
            </div>
          </div>
        </div>

        {/* recent submissions */}
        <div className="bg-white rounded-2xl p-6 shadow">
          <h2 className="text-xl font-bold mb-4">Recent Submissions</h2>
          {subs.length === 0 ? (
            <p className="text-gray-600">
              No submissions yet. Use{" "}
              <span className="font-semibold">Join a Session</span> when your
              teacher starts one.
            </p>
          ) : (
            <ul className="divide-y">
              {subs.map((s, i) => (
                <li key={i} className="py-3 flex items-center justify-between">
                  <div>
                    <div className="font-semibold">
                      {s.course_title ?? "Course"}
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date(s.created_at).toLocaleString()} —{" "}
                      {s.status ?? "submitted"}
                    </div>
                  </div>
                  <div className="text-sm text-gray-600">
                    LS:{" "}
                    <span className="font-medium">
                      {s.learning_style ?? "—"}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
