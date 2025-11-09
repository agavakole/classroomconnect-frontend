// src/pages/Home.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();

  // If a teacher started a session in this browser, show a real QR.
  const [joinToken, setJoinToken] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("session");
      if (!raw) return;
      const s = JSON.parse(raw);
      if (s?.joinToken) setJoinToken(String(s.joinToken));
    } catch {
      /* ignore */
    }
  }, []);

  // Simple QR without extra libs
  const qrUrl = joinToken
    ? `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(
        `${window.location.origin}/join/${joinToken}`
      )}`
    : null;

  return (
    <div
      className="
    min-h-screen flex flex-col relative
    bg-no-repeat bg-cover
    bg-[position:center_105%]    /* slight push on mobile/tablet */
    lg:bg-[position:center_100%] /* more on large screens */
    xl:bg-[position:center_60%] /* even more on desktop */
  "
      style={{
        backgroundImage: `
      linear-gradient(to bottom right, rgba(255,255,255,0.20), rgba(255,255,255,0.68)),
      url('/images/3d-image.png')
    `,
      }}
    >
      {/* NAVBAR */}
      <header className="w-full border-b border-white/60 bg-white/70 backdrop-blur-sm">
        <nav className="max-w-6xl mx-auto flex items-center justify-between px-4 py-4">
          <button
            onClick={() => navigate("/")}
            className="text-2xl sm:text-3xl font-extrabold text-gray-900"
          >
            Class<span className="text-[#0AC5FF]">Connect</span>
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
        <section className="max-w-6xl mx-auto px-4 sm:px-8 lg:px-12 pt-16 sm:pt-20 md:pt-24 xl:pt-28 pb-16">
          <div className="grid xl:grid-cols-2 gap-10 items-start">
            {/* 1) LEFT: Copy (no buttons) */}
            <div className="mt-2 order-2 xl:order-1">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight">
                Check in fast.
                <br />
                Learn smarter.
              </h1>
              <p className="mt-6 sm:mt-8 text-lg sm:text-xl text-gray-800 max-w-[55ch]">
                Students scan, share mood, answer a quick survey, and instantly
                get a personalized activity. Teachers see the class picture at a
                glance.
              </p>
              <div className="mt-4 text-sm text-gray-900">
                Are you a teacher?{" "}
                <button
                  onClick={() => navigate("/teacher/dashboard")}
                  className="text-[#0072FF] font-semibold underline underline-offset-4 hover:opacity-80"
                >
                  Open the dashboard →
                </button>
              </div>
            </div>
            {/* Right: Card with QR */}
           <div className="relative order-2 xl:order-2 mt-16">
              <div
                className="
                  rounded-3xl p-6 sm:p-8
                  backdrop-blur-2xl bg-white/85
                  ring-1 ring-black/10
                  shadow-[0_20px_50px_rgba(0,0,0,0.18)]
                "
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#6EE7B7] to-[#0AC5FF]" />
                  <div>
                    <p className="text-lg font-bold text-gray-900">
                      Today’s Session
                    </p>
                    <p className="text-gray-700 text-sm">
                      {joinToken
                        ? "Scan to check in"
                        : "QR appears when a session starts"}
                    </p>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-4">
                  {/* Glass sub-card: QR box */}
                  <div className="rounded-2xl p-4 text-center text-gray-700 flex items-center justify-center border border-black/10 bg-white/45">
                    {qrUrl ? (
                      <img
                        src={qrUrl}
                        alt="Session QR"
                        className="w-[210px] h-[210px] object-contain"
                      />
                    ) : (
                      <div>
                        <div className="font-semibold mb-1">QR preview</div>
                        <div className="text-xs">
                          Start a session to display the QR here
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Glass sub-card: Featured activity */}
                  <div className="rounded-2xl p-4 border border-black/10 bg-white/70">
                    <p className="text-sm text-gray-600 mb-1">
                      Featured activity
                    </p>
                    <p className="font-semibold text-gray-900">Pattern Match</p>
                    <p className="text-gray-700 text-sm mt-1">
                      3–5 min • Visual • Game
                    </p>
                  </div>
                </div>

                <div className="mt-6 grid sm:grid-cols-3 gap-3">
                  <span className="rounded-xl bg-white/70 text-[#0369A1] px-3 py-2 text-sm font-semibold text-center ring-1 ring-white/60">
                    Mood check
                  </span>
                  <span className="rounded-xl bg-white/70 text-[#0F172A] px-3 py-2 text-sm font-semibold text-center ring-1 ring-white/60">
                    Short survey
                  </span>
                  <span className="rounded-xl bg-white/70 text-[#065F46] px-3 py-2 text-sm font-semibold text-center ring-1 ring-white/60">
                    Recommendation
                  </span>
                </div>

                <p className="mt-6 text-gray-800 text-center">
                  Instant, student-friendly flow with zero friction.
                </p>
              </div>
            </div>
            {/* 3) BUTTONS — mobile: after the card; desktop: below the text (same left column) */}
            <div className="order-3 w-full">
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => navigate("/join")}
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
            <button
              onClick={() => navigate("/login")}
              className="hover:text-[#0072FF]"
            >
              Log in
            </button>
            <button
              onClick={() => navigate("/signup")}
              className="hover:text-[#0072FF]"
            >
              Sign up
            </button>
            <button
              onClick={() => navigate("/join")}
              className="hover:text-[#0072FF]"
            >
              Join with code
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
