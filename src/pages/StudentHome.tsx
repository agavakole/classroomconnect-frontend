// src/pages/StudentHome.tsx
import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { authApi } from "../services/api";
import { getStudentToken } from "../auth";

/**
 * Student dashboard - shows profile and submission history
 * 
 * Features:
 * - Display student profile (name, email, join date)
 * - Show recent survey submissions with results
 * - Quick access to join new sessions
 * 
 * Backend connections:
 * - GET /api/students/me - Fetch student profile
 * - GET /api/students/submissions - Fetch submission history
 * 
 * Protected route: requires student authentication
 * Redirects to login if no valid token
 */
export default function StudentHome() {
  const nav = useNavigate();
  const [profile, setProfile] = useState<any>(null); // Student profile data
  const [subs, setSubs] = useState<any[]>([]); // Submission history
  const [loading, setLoading] = useState(true);

  // Shared CSS classes matching teacher pages
  const panel = "bg-white ring-1 ring-gray-200 rounded-3xl shadow-sm";
  const primaryBtn =
    "px-4 py-2 rounded-xl bg-gradient-to-r from-[#00C6FF] to-[#0072FF] text-white font-semibold shadow-[0_10px_20px_rgba(38,132,255,0.35)] hover:shadow-[0_14px_28px_rgba(38,132,255,0.45)] transition";
  const subtleBtn =
    "px-4 py-2 rounded-xl bg-white border-2 border-gray-200 hover:border-[#0072FF] font-semibold transition";

  /**
   * On mount: fetch student data or redirect to login
   * Runs once when component loads
   */
  useEffect(() => {
    const token = getStudentToken(); // Check localStorage for auth token
    if (!token) {
      // No token - student not logged in
      nav("/student/login", { replace: true });
      return;
    }
    
    // Fetch profile and submission history in parallel
    (async () => {
      try {
        const [p, h] = await Promise.all([
          authApi.getStudentProfile(token),      // GET /api/students/me
          authApi.getStudentSubmissions(token),  // GET /api/students/submissions
        ]);
        setProfile(p);
        setSubs(h?.submissions || []);
      } finally {
        setLoading(false);
      }
    })();
  }, [nav]);

  // Loading screen
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

  /**
   * Logs out student completely
   * Removes:
   * - Auth token (localStorage)
   * - Session data (sessionStorage)
   * - Cached names (sessionStorage)
   */
  const logout = () => {
    localStorage.removeItem("student_token");
    sessionStorage.removeItem("session");
    sessionStorage.removeItem("student_full_name");
    sessionStorage.removeItem("guest_name");
    nav("/", { replace: true });
  };

  // Extract first name from full name for greeting
  const fullName: string | undefined = profile?.full_name;
  const firstName = fullName?.split(" ")[0];

  /**
   * Extracts learning style from submission object
   * Backend may use various field names, checks all possibilities
   * Returns empty string if no learning style found
   */
  function pickLearningStyle(s: any): string | "" {
    // Check common field names
    const direct =
      s?.learning_style ||
      s?.style ||
      s?.learning_style_category ||
      s?.result?.learning_style ||
      s?.profile?.learning_style ||
      s?.profile?.dominant_style;
    if (direct) return String(direct);

    // Check if scores object exists (calculate from scores)
    const scores =
      s?.scores ||
      s?.learning_style_scores ||
      s?.style_scores ||
      s?.computed_scores;

    if (scores && (scores.visual != null || scores.auditory != null || scores.kinesthetic != null)) {
      // Find highest score
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

  /**
   * Extracts mood from submission object
   * Checks various field name possibilities
   */
  function pickMood(s: any): string | "" {
    return (
      s?.mood ||
      s?.mood_label ||
      s?.result?.mood ||
      s?.profile?.mood ||
      ""
    );
  }

  return (
    <div
      className="min-h-screen
      bg-no-repeat bg-cover
      bg-[position:center_105%]
    lg:bg-[position:center_100%]
    xl:bg-[position:center_60%]"
      style={{
        backgroundImage: `
          linear-gradient(to bottom right, rgba(255,255,255,0.50), rgba(255,255,255,0.50)),
          url('/images/3d-image.png')
        `,
      }}
    >
      {/* HEADER - sticky navigation bar */}
      <header className="sticky top-0 z-30 border-b border-gray-200 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <span className="text-2xl font-extrabold text-gray-900">
              Class<span className="text-[#0AC5FF]">Connect</span>
            </span>
          </div>
          
          {/* Action buttons */}
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

      {/* MAIN CONTENT */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* WELCOME SECTION - profile summary */}
        <section className={`${panel} p-6 sm:p-8`}>
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              {/* Student avatar icon */}
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
                  Here's your account and recent activity.
                </p>
              </div>
            </div>
          </div>

          {/* Profile info grid */}
          <div className="mt-6 grid sm:grid-cols-2 gap-4">
            {/* Email */}
            <div className="rounded-2xl ring-1 ring-gray-200 bg-white p-4">
              <div className="text-sm text-gray-500">Email</div>
              <div className="font-semibold">{profile?.email ?? "—"}</div>
            </div>
            
            {/* Member since date */}
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

        {/* RECENT SUBMISSIONS SECTION */}
        <section className={`${panel} p-6 sm:p-8`}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">
              Recent Submissions
            </h2>
            {/* Show join button if submissions exist */}
            {subs.length > 0 && (
              <Link to="/join" className={subtleBtn}>
                Join another session
              </Link>
            )}
          </div>

          {subs.length === 0 ? (
            // Empty state - no submissions yet
            <div className="rounded-2xl ring-1 ring-gray-200 bg-white p-8 text-center text-gray-600">
              No submissions yet. Tap{" "}
              <span className="font-semibold">Join a Session</span> to get
              started.
            </div>
          ) : (
            // Submissions list
            <ul className="divide-y divide-gray-200">
              {subs.map((s, i) => {
                const style = pickLearningStyle(s);
                const mood = pickMood(s);
                
                // Build metadata string (date + status)
                const metaBits = [
                  new Date(s.created_at).toLocaleString(),
                  s.status ?? "submitted",
                ].filter(Boolean);

                return (
                  <li key={i} className="py-4 flex items-center justify-between">
                    <div>
                      {/* Course title */}
                      <div className="font-semibold text-gray-900">
                        {s.course_title ?? "Course"}
                      </div>
                      {/* Metadata (date + status) */}
                      <div className="text-sm text-gray-600">
                        {metaBits.join(" — ")}
                      </div>
                    </div>
                    
                    {/* Result badges */}
                    <div className="flex items-center gap-2">
                      {/* Learning style badge (if available) */}
                      {style && (
                        <span className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-700 capitalize">
                          Learning style: {style}
                        </span>
                      )}
                      {/* Mood badge (if available) */}
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

        {/* HELPFUL TIP BOX */}
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