// src/pages/Login.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authApi } from "../services/api";

export function Login() {
  const navigate = useNavigate();

  // Form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userType, setUserType] = useState<"student" | "teacher">("student");

  // UI state
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      if (userType === "teacher") {
        const { access_token } = await authApi.teacherLogin(email, password);
        localStorage.setItem("teacher_token", access_token);
        localStorage.setItem("user_type", "teacher");
        navigate("/teacher/dashboard", { replace: true });
      } else {
        const { access_token } = await authApi.studentLogin(email, password);
        localStorage.setItem("student_token", access_token);
        localStorage.setItem("user_type", "student");
        navigate("/student/home", { replace: true }); // << student destination
      }
    } catch (err: any) {
      const msg =
        err?.status === 401 ||
        String(err?.message || "")
          .toLowerCase()
          .includes("unauthorized")
          ? "Invalid email or password."
          : err?.message || "Login failed. Please try again.";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen bg-[#E6F6FF] relative flex items-center justify-center px-4
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
      <div className="relative z-10 w-full max-w-md">
        {/* Back Button */}
        <button
          onClick={() => navigate("/")}
          className="mb-4 text-gray-600 hover:text-gray-800 flex items-center gap-2"
        >
          <span>←</span> Back to Home
        </button>

        <div className="bg-white/70 backdrop-blur-xl ring-1 ring-white/60 shadow-[0_20px_40px_rgba(0,0,0,0.12)] rounded-[32px] p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Welcome Back! 👋
            </h1>
            <p className="text-gray-600">Log in to continue</p>
          </div>

          {/* Role Toggle */}
          <div className="flex gap-2 mb-6 bg-gray-100 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setUserType("student")}
              className={`flex-1 py-3 rounded-lg font-semibold transition-all ${
                userType === "student"
                  ? "bg-white text-[#0072FF] shadow-md"
                  : "text-gray-600"
              }`}
            >
              Student
            </button>
            <button
              type="button"
              onClick={() => setUserType("teacher")}
              className={`flex-1 py-3 rounded-lg font-semibold transition-all ${
                userType === "teacher"
                  ? "bg-white text-[#0072FF] shadow-md"
                  : "text-gray-600"
              }`}
            >
              Teacher
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@example.com"
                required
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#0072FF] focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#0072FF] focus:outline-none transition-colors"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-gradient-to-r from-[#00C6FF] to-[#0072FF] text-white text-lg font-semibold rounded-xl shadow-[0_10px_24px_rgba(38,132,255,0.35)] hover:shadow-[0_14px_32px_rgba(38,132,255,0.45)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Logging in..." : "Log In"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Don’t have an account?{" "}
              <button
                onClick={() => navigate("/signup")}
                className="text-[#0072FF] font-semibold hover:underline"
              >
                Sign up
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
