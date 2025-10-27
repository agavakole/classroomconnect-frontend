// src/pages/Home.tsx
import React from "react";

interface HomeProps {
  onStudent: () => void;
}

export function Home({ onStudent }: HomeProps) {
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
      <header className="relative z-10 text-center mt-[calc(env(safe-area-inset-top,0)+100px)]">
        <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold text-gray-900 drop-shadow-sm">
          Classroom<span className="text-[#0AC5FF]">Connect</span>
        </h1>
        <p className="text-lg sm:text-xl md:text-4xl text-gray-700 mt-4 font-medium">
          Have fun learning! ✨
        </p>
      </header>

      {/* ===== BUTTON SECTION ===== */}
      {/* ===== BUTTON DOCK ===== */}
      <div className="relative z-10 w-full px-5 pb-[calc(env(safe-area-inset-bottom,0)+100px)] flex justify-center">
        {/* Responsive glass dock */}
        <div
          className="
      w-full
      max-w-[420px] sm:max-w-[540px] md:max-w-[640px] lg:max-w-[720px]
      bg-white/50 backdrop-blur-xl ring-1 ring-white/60
      shadow-[0_20px_40px_rgba(0,0,0,0.12)]
      rounded-[32px] p-4 sm:p-6
      flex flex-col gap-4
    "
        >
          {/* Student Button */}
          <button
            onClick={onStudent}
            className="
        group relative w-full py-5 sm:py-6 md:py-7
        rounded-[2rem] text-lg sm:text-xl md:text-2xl font-semibold text-white
        bg-gradient-to-r from-[#00C6FF] to-[#0072FF]
        shadow-[0_14px_30px_rgba(38,132,255,0.45)]
        hover:shadow-[0_18px_40px_rgba(38,132,255,0.55)]
        transition-all duration-200 ease-out
        focus:outline-none focus:ring-4 focus:ring-cyan-200/60
        active:translate-y-[1px]
      "
          >
            {/* glossy highlight strip */}
            <span className="pointer-events-none absolute inset-x-2 top-0 h-[50%] rounded-t-[2rem] bg-white/15" />
            <span className="relative z-[1] flex items-center justify-center gap-3">
              <span>I’m a Student</span>
            </span>
          </button>

          {/* Teacher Button (disabled) */}
          <button
            className="
       group relative w-full py-5 sm:py-6 md:py-7
        rounded-[2rem] text-lg sm:text-xl md:text-2xl font-semibold text-white
        bg-gradient-to-r from-[#00C6FF] to-[#0072FF]
        shadow-[0_14px_30px_rgba(38,132,255,0.45)]
        hover:shadow-[0_18px_40px_rgba(38,132,255,0.55)]
        transition-all duration-200 ease-out
        focus:outline-none focus:ring-4 focus:ring-cyan-200/60
        active:translate-y-[1px]
      "
            aria-disabled="true"
          >
            <span className="flex items-center justify-center gap-3">
              <span>I’m a Teacher</span>
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
