// src/pages/Signup.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authApi } from "../services/api";

export function Signup() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [userType, setUserType] = useState<"student" | "teacher">("student");

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords don't match!");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters!");
      return;
    }

    setIsLoading(true);
    try {
      if (userType === "student") {
        await authApi.studentSignup(email, password, name);
        const { access_token } = await authApi.studentLogin(email, password);
        localStorage.setItem("student_token", access_token);
        localStorage.setItem("user_type", "student");
        navigate("/student/home", { replace: true });
      } else {
        await authApi.teacherSignup(email, password, name);
        const { access_token } = await authApi.teacherLogin(email, password);
        localStorage.setItem("teacher_token", access_token);
        localStorage.setItem("user_type", "teacher");
        navigate("/teacher/dashboard", { replace: true });
      }
    } catch (err: any) {
      setError(err?.message || "Signup failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen bg-[#E6F6FF] relative flex items-center justify-center px-4 py-8"
      style={{
        backgroundImage: "url('/images/3d-image.png')",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "bottom center",
        backgroundSize: "cover",
      }}
    >
      <div className="relative z-10 w-full max-w-md">
        <button
          onClick={() => navigate("/")}
          className="mb-4 text-gray-600 hover:text-gray-800 flex items-center gap-2"
        >
          <span>←</span> Back to Home
        </button>

        <div className="bg-white/70 backdrop-blur-xl ring-1 ring-white/60 shadow-[0_20px_40px_rgba(0,0,0,0.12)] rounded-[32px] p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Create Account ✨
            </h1>
            <p className="text-gray-600">Join ClassroomConnect today</p>
          </div>

          <div className="flex gap-2 mb-6 bg-gray-100 p-1 rounded-xl">
            <button
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
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                required
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#0072FF] focus:outline-none transition-colors"
              />
            </div>

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
                minLength={6}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#0072FF] focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
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
              {isLoading ? "Creating Account..." : "Sign Up"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Already have an account?{" "}
              <button
                onClick={() => navigate("/login")}
                className="text-[#0072FF] font-semibold hover:underline"
              >
                Log in
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
