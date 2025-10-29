import React from "react";

interface HomeProps {
  onStudent: () => void;
  onLogin?: () => void; // Optional for now (Week 2)
  onSignup?: () => void; // Optional for now (Week 2)
}

export function Home({ onStudent, onLogin, onSignup }: HomeProps) {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-between px-4 bg-[#E6F6FF] relative"
      style={{
        backgroundImage: "url('/images/3d-image.png')",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "bottom center",
        backgroundSize: "cover",
      }}
    >
      {/* ===== HEADER ===== */}
      <header className="relative z-10 text-center mt-[calc(env(safe-area-inset-top,0)+80px)] px-4">
        <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold text-gray-900 drop-shadow-sm">
          Classroom<span className="text-[#0AC5FF]">Connect</span>
        </h1>
        <p className="text-lg sm:text-xl md:text-2xl text-gray-700 mt-4 font-medium">
          Discover how you learn best! ✨
        </p>
      </header>

      {/* ===== MAIN ACTIONS ===== */}
      <div className="relative z-10 w-full px-5 pb-[calc(env(safe-area-inset-bottom,0)+80px)] flex justify-center">
        {/* Glass Card */}
        <div
          className="
            w-full
            max-w-[420px] sm:max-w-[540px] md:max-w-[640px]
            bg-white/70 backdrop-blur-xl ring-1 ring-white/60
            shadow-[0_20px_40px_rgba(0,0,0,0.12)]
            rounded-[32px] p-6 sm:p-8
            flex flex-col items-center gap-4
          "
        >
          {/* Welcome Text */}
          <div className="text-center mb-2">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">
              Welcome! 👋
            </h2>
            <p className="text-gray-600 text-sm sm:text-base mt-2">
              Get started with your learning journey
            </p>
          </div>

          {/* Login Button */}
          <button
            onClick={onLogin || (() => alert("Login coming soon"))}
            className="
              group relative w-full py-5 sm:py-6
              rounded-[1.5rem] text-lg sm:text-xl font-semibold text-white
              bg-gradient-to-r from-[#00C6FF] to-[#0072FF]
              shadow-[0_10px_24px_rgba(38,132,255,0.35)]
              hover:shadow-[0_14px_32px_rgba(38,132,255,0.45)]
              transition-all duration-200 ease-out
              focus:outline-none focus:ring-4 focus:ring-cyan-200/60
              active:translate-y-[1px]
            "
          >
            <span className="relative z-[1] flex items-center justify-center gap-3">
              <span>Log In</span>
            </span>
          </button>

          {/* Sign Up Button */}
          <button
            onClick={onSignup || (() => alert("Sign up coming soon"))}
            className="
              group relative w-full py-5 sm:py-6
              rounded-[1.5rem] text-lg sm:text-xl font-semibold
              text-[#0072FF] bg-white
              border-2 border-[#0072FF]
              shadow-[0_8px_20px_rgba(0,0,0,0.08)]
              hover:shadow-[0_12px_28px_rgba(0,0,0,0.12)]
              hover:bg-[#0072FF] hover:text-white
              transition-all duration-200 ease-out
              focus:outline-none focus:ring-4 focus:ring-cyan-200/60
              active:translate-y-[1px]
            "
          >
            <span className="relative z-[1] flex items-center justify-center gap-3">
              <span>Sign Up</span>
            </span>
          </button>

          {/* Divider */}
          <div className="flex items-center gap-4 w-full my-2">
            <div className="flex-1 h-[1px] bg-gray-300"></div>
            <span className="text-gray-500 text-sm font-medium">OR</span>
            <div className="flex-1 h-[1px] bg-gray-300"></div>
          </div>

          {/* Continue as Guest Button */}
          <button
            onClick={onStudent}
            className="
              group relative w-full py-5 sm:py-6
              rounded-[1.5rem] text-lg sm:text-xl font-semibold
              text-gray-700 bg-gray-100
              hover:bg-gray-200
              shadow-[0_6px_16px_rgba(0,0,0,0.06)]
              hover:shadow-[0_10px_24px_rgba(0,0,0,0.10)]
              transition-all duration-200 ease-out
              focus:outline-none focus:ring-4 focus:ring-gray-300/60
              active:translate-y-[1px]
            "
          >
            <span className="relative z-[1] flex items-center justify-center gap-3">
              <span>Continue as Guest</span>
            </span>
          </button>

          {/* Helper Text */}
          <p className="text-gray-600 text-xs sm:text-sm text-center mt-4 px-4">
            Guest mode lets you try the survey without creating an account
          </p>
        </div>
      </div>

      {/* ===== FOOTER INFO ===== */}
      <div className="absolute bottom-4 left-0 right-0 z-0">
        <p className="text-center text-gray-500 text-xs sm:text-sm">
          A tool to help students discover their learning style 🌈
        </p>
      </div>
    </div>
  );
}
