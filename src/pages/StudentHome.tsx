// src/pages/StudentHome.tsx
import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { authApi } from "../services/api";
import { getStudentToken } from "../auth";

export default function StudentHome() {
  const nav = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [subs, setSubs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // shared styles (match Teacher pages)
  const panel = "bg-white ring-1 ring-gray-200 rounded-3xl shadow-sm";
  const primaryBtn =
    "px-4 py-2 rounded-xl bg-gradient-to-r from-[#00C6FF] to-[#0072FF] text-white font-semibold shadow-[0_10px_20px_rgba(38,132,255,0.35)] hover:shadow-[0_14px_28px_rgba(38,132,255,0.45)] transition";
  const subtleBtn =
    "px-4 py-2 rounded-xl bg-white border-2 border-gray-200 hover:border-[#0072FF] font-semibold transition";

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
      <div
        className="min-h-screen flex items-center justify-center
        bg-no-repeat bg-cover bg-[position:center_220%]"
        style={{
          backgroundImage: `
            linear-gradient(to bottom right, rgba(255,255,255,0.65), rgba(255,255,255,0.95)),
            url('/images/3d-image.png')
          `,
        }}
      >
        <div className="animate-pulse text-gray-700 text-lg">Loading…</div>
      </div>
    );
  }

  const logout = () => {
    localStorage.removeItem("student_token");
    sessionStorage.removeItem("session");
    sessionStorage.removeItem("student_full_name");
    sessionStorage.removeItem("guest_name");
    nav("/", { replace: true });
  };

  const fullName: string | undefined = profile?.full_name;
  const firstName = fullName?.split(" ")[0];

  // ---------- NEW: small helpers to avoid the "—" ----------
  function pickLearningStyle(s: any): string | "" {
    // common alternate names from different payloads
    const direct =
      s?.learning_style ||
      s?.style ||
      s?.learning_style_category ||
      s?.result?.learning_style ||
      s?.profile?.learning_style ||
      s?.profile?.dominant_style;
    if (direct) return String(direct);

    // try scores-like shapes
    const scores =
      s?.scores ||
      s?.learning_style_scores ||
      s?.style_scores ||
      s?.computed_scores;

    if (scores && (scores.visual != null || scores.auditory != null || scores.kinesthetic != null)) {
      const entries: Array<[string, number]> = [
        ["visual", Number(scores.visual ?? 0)],
        ["auditory", Number(scores.auditory ?? 0)],
        ["kinesthetic", Number(scores.kinesthetic ?? 0)],
      ];
      entries.sort((a, b) => b[1] - a[1]);
      return entries[0][1] > 0 ? entries[0][0] : "";
    }

    return "";
  }

  function pickMood(s: any): string | "" {
    return (
      s?.mood ||
      s?.mood_label ||
      s?.result?.mood ||
      s?.profile?.mood ||
      ""
    );
  }
  // --------------------------------------------------------

  return (
    <div
      className="min-h-screen
      bg-no-repeat bg-cover
      bg-[position:center_105%]    /* slight push on mobile/tablet */
    lg:bg-[position:center_100%] /* more on large screens */
    xl:bg-[position:center_60%] "
      style={{
        backgroundImage: `
          linear-gradient(to bottom right, rgba(255,255,255,0.50), rgba(255,255,255,0.50)),
          url('/images/3d-image.png')
        `,
      }}
    >
      {/* Header (solid to match Teacher) */}
      <header className="sticky top-0 z-30 border-b border-gray-200 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl font-extrabold text-gray-900">
              Class<span className="text-[#0AC5FF]">Connect</span>
            </span>
          </div>
          <div className="flex gap-2">
            <Link to="/join" className={primaryBtn}>
              Join a Session
            </Link>
            <button onClick={logout} className={subtleBtn}>
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Welcome / profile summary */}
        <section className={`${panel} p-6 sm:p-8`}>
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <img
                src="/images/cap-img.png"
                alt="student icon"
                className="w-12 h-12 rounded-3xl object-contain"
              />

              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
                  Welcome back{firstName ? `, ${firstName}` : ""}!
                </h1>
                <p className="text-gray-700">
                  Here’s your account and recent activity.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 grid sm:grid-cols-2 gap-4">
            <div className="rounded-2xl ring-1 ring-gray-200 bg-white p-4">
              <div className="text-sm text-gray-500">Email</div>
              <div className="font-semibold">{profile?.email ?? "—"}</div>
            </div>
            <div className="rounded-2xl ring-1 ring-gray-200 bg-white p-4">
              <div className="text-sm text-gray-500">Member since</div>
              <div className="font-semibold">
                {profile?.created_at
                  ? new Date(profile.created_at).toLocaleDateString()
                  : "—"}
              </div>
            </div>
          </div>
        </section>

        {/* Recent submissions */}
        <section className={`${panel} p-6 sm:p-8`}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">
              Recent Submissions
            </h2>
            {subs.length > 0 && (
              <Link to="/join" className={subtleBtn}>
                Join another session
              </Link>
            )}
          </div>

          {subs.length === 0 ? (
            <div className="rounded-2xl ring-1 ring-gray-200 bg-white p-8 text-center text-gray-600">
              No submissions yet. Tap{" "}
              <span className="font-semibold">Join a Session</span> to get
              started.
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {subs.map((s, i) => {
                const style = pickLearningStyle(s);
                const mood = pickMood(s);
                const metaBits = [
                  new Date(s.created_at).toLocaleString(),
                  s.status ?? "submitted",
                ].filter(Boolean);

                return (
                  <li key={i} className="py-4 flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-gray-900">
                        {s.course_title ?? "Course"}
                      </div>
                      <div className="text-sm text-gray-600">
                        {metaBits.join(" — ")}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {style && (
                        <span className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-700 capitalize">
                          Learning style: {style}
                        </span>
                      )}
                      {mood && (
                        <span className="text-xs px-2 py-1 rounded bg-purple-100 text-purple-700 capitalize">
                          Mood: {mood}
                        </span>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        {/* Helpful tip */}
        <section className="rounded-3xl ring-1 ring-blue-200 bg-blue-50 p-4">
          <div className="flex gap-3">
            <span className="text-2xl">💡</span>
            <div className="text-blue-900">
              After you join a session, complete the short survey to get a
              personalized activity based on your learning style and mood.
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
