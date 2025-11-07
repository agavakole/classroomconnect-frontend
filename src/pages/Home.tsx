// src/pages/Home.tsx
import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#EAF6FF] via-[#F7FBFF] to-[#EAF6FF]">
      {/* NAVBAR */}
      <header className="w-full border-b border-white/60 bg-white/70 backdrop-blur-sm">
        <nav className="max-w-6xl mx-auto flex items-center justify-between px-4 py-4">
          <button
            onClick={() => navigate("/")}
            className="text-2xl sm:text-3xl font-extrabold text-gray-900"
          >
            Classroom<span className="text-[#0AC5FF]">Connect</span>
          </button>
          <div className="hidden sm:flex items-center gap-2">
            <button
              onClick={() => navigate("/login")}
              className="px-4 py-2 rounded-xl bg-white border-2 border-gray-200 hover:border-[#0072FF] font-semibold transition"
            >
              Log in
            </button>
            <button
              onClick={() => navigate("/signup")}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#00C6FF] to-[#0072FF] text-white font-semibold shadow-[0_10px_20px_rgba(38,132,255,0.35)] hover:shadow-[0_14px_28px_rgba(38,132,255,0.45)] transition"
            >
              Sign up
            </button>
          </div>
        </nav>
      </header>

      {/* HERO */}
      <main className="flex-1">
        <section className="max-w-6xl mx-auto px-4 pt-10 pb-16 lg:pt-16">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            {/* Left: Copy */}
            <div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight">
                Check in fast.
                <br />
                Learn smarter.
              </h1>
              <p className="mt-4 text-lg sm:text-xl text-gray-700">
                Students scan, share mood, answer a quick survey, and instantly
                get a personalized activity. Teachers see the class picture at a glance.
              </p>

              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => navigate("/welcome")}
                  className="px-6 py-4 rounded-2xl bg-gradient-to-r from-[#00C6FF] to-[#0072FF] text-white font-semibold shadow-[0_10px_24px_rgba(38,132,255,0.35)] hover:shadow-[0_14px_32px_rgba(38,132,255,0.45)] transition"
                >
                  Join with code / QR
                </button>
                <button
                  onClick={() => navigate("/signup")}
                  className="px-6 py-4 rounded-2xl bg-white border-2 border-gray-200 hover:border-[#0072FF] font-semibold transition"
                >
                  Create an account
                </button>
                <button
                  onClick={() => navigate("/login")}
                  className="px-6 py-4 rounded-2xl bg-white border-2 border-gray-200 hover:border-[#0072FF] font-semibold transition"
                >
                  Log in
                </button>
              </div>

              <div className="mt-4 text-sm text-gray-600">
                Are you a teacher?{" "}
                <button
                  onClick={() => navigate("/teacher/dashboard")}
                  className="text-[#0072FF] font-semibold underline underline-offset-4 hover:opacity-80"
                >
                  Open the dashboard →
                </button>
              </div>
            </div>

            {/* Right: Clean Hero Card (no busy background) */}
            <div className="relative">
              <div className="bg-white/90 backdrop-blur-xl border border-white/80 rounded-3xl p-6 sm:p-8 shadow-[0_20px_40px_rgba(0,0,0,0.10)]">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#6EE7B7] to-[#0AC5FF]" />
                  <div>
                    <p className="text-lg font-bold text-gray-800">
                      Today’s Session
                    </p>
                    <p className="text-gray-600 text-sm">Scan to check in</p>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-4">
                  <div className="rounded-2xl border-2 border-dashed border-gray-200 p-6 text-center text-gray-500">
                    QR preview
                  </div>
                  <div className="rounded-2xl bg-white p-4 border-2 border-gray-100">
                    <p className="text-sm text-gray-500 mb-1">
                      Featured activity
                    </p>
                    <p className="font-semibold text-gray-800">Pattern Match</p>
                    <p className="text-gray-600 text-sm mt-1">
                      3–5 min • Visual • Game
                    </p>
                  </div>
                </div>

                <div className="mt-6 grid sm:grid-cols-3 gap-3">
                  <span className="rounded-xl bg-[#F0F9FF] text-[#0369A1] px-3 py-2 text-sm font-semibold text-center">
                    Mood check
                  </span>
                  <span className="rounded-xl bg-[#F1F5F9] text-[#0F172A] px-3 py-2 text-sm font-semibold text-center">
                    Short survey
                  </span>
                  <span className="rounded-xl bg-[#ECFDF5] text-[#065F46] px-3 py-2 text-sm font-semibold text-center">
                    Recommendation
                  </span>
                </div>

                <p className="mt-6 text-gray-700 flex items-center">
                  Instant, student-friendly
                  flow with zero friction.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* FEATURES (high contrast cards) */}
        <section className="max-w-6xl mx-auto px-4 pb-16">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 text-center">
            Built for classrooms
          </h2>

          <div className="mt-8 grid md:grid-cols-3 gap-5">
            <div className="bg-white rounded-2xl p-6 shadow-[0_10px_24px_rgba(0,0,0,0.06)] border border-white/80">
              <div className="text-3xl mb-3">⚡</div>
              <p className="font-bold text-gray-800">Fast onboarding</p>
              <p className="text-gray-600 mt-1">
                Guest mode or accounts—both work with the same QR flow.
              </p>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-[0_10px_24px_rgba(0,0,0,0.06)] border border-white/80">
              <div className="text-3xl mb-3">🔒</div>
              <p className="font-bold text-gray-800">Private by default</p>
              <p className="text-gray-600 mt-1">
                Only the class and teacher see session data.
              </p>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-[0_10px_24px_rgba(0,0,0,0.06)] border border-white/80">
              <div className="text-3xl mb-3">📊</div>
              <p className="font-bold text-gray-800">Actionable insights</p>
              <p className="text-gray-600 mt-1">
                Mood summary + activity matches—ready in seconds.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-white/60 bg-white/70 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-gray-600 text-sm">
            © {new Date().getFullYear()} ClassroomConnect
          </p>
          <div className="text-sm text-gray-600 flex items-center gap-4">
            <button onClick={() => navigate("/login")} className="hover:text-[#0072FF]">
              Log in
            </button>
            <button onClick={() => navigate("/signup")} className="hover:text-[#0072FF]">
              Sign up
            </button>
            <button onClick={() => navigate("/welcome")} className="hover:text-[#0072FF]">
              Join with code
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
