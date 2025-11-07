// src/pages/Home.tsx
import { useNavigate } from "react-router-dom";

export default function Home() {
  const nav = useNavigate();

  return (
    <div
      className="min-h-screen bg-[#E6F6FF] relative flex items-center justify-center px-4"
      style={{
        backgroundImage: "url('/images/3d-image.png')",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "bottom center",
        backgroundSize: "cover",
      }}
    >
      <div className="relative z-10 w-full max-w-xl">
        {/* Card */}
        <div className="bg-white/70 backdrop-blur-xl ring-1 ring-white/60 shadow-[0_20px_40px_rgba(0,0,0,0.12)] rounded-[32px] p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900">
              Classroom<span className="text-[#0AC5FF]">Connect</span>
            </h1>
            <p className="text-gray-600 mt-3 text-lg">Have fun learning! ✨</p>
          </div>

          {/* Actions */}
          <div className="grid gap-3">
            <button
              onClick={() => nav("/join")}
              className="w-full py-4 rounded-2xl font-semibold text-white text-lg
                         bg-gradient-to-r from-[#00C6FF] to-[#0072FF]
                         shadow-[0_10px_24px_rgba(38,132,255,0.35)]
                         hover:shadow-[0_14px_32px_rgba(38,132,255,0.45)]
                         transition-transform active:scale-[0.98]"
            >
              🚀 Join a Session (QR / Code)
            </button>

            <button
              onClick={() => nav("/login")}
              className="w-full py-4 rounded-2xl font-semibold text-gray-800 text-lg
                         bg-white border-2 border-gray-200
                         hover:border-[#0072FF] hover:bg-white/90
                         transition-colors"
            >
              🔑 Log in
            </button>

            <button
              onClick={() => nav("/signup")}
              className="w-full py-4 rounded-2xl font-semibold text-gray-800 text-lg
                         bg-white border-2 border-gray-200
                         hover:border-[#0AC5FF] hover:bg-white/90
                         transition-colors"
            >
              🌟 Create an Account
            </button>
          </div>

          {/* Helper text */}
        </div>

        {/* Tiny footer */}
        <div className="mt-6 text-center text-xs text-gray-500">
          © {new Date().getFullYear()} ClassroomConnect
        </div>
      </div>
    </div>
  );
}
