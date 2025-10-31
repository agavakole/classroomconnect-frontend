import { useState } from "react";

interface LoginProps {
  onLogin: (userType: "student" | "teacher") => void;
  onBackToHome: () => void;
}

export function Login({ onLogin, onBackToHome }: LoginProps) {
  // State for form inputs
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userType, setUserType] = useState<"student" | "teacher">("student");

  // State for UI
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      // TODO: Week 2 Session 2 - Connect to backend
      console.log("Login attempt:", { email, password, userType });

      // Simulate API call (1 second delay)
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Success! Tell App.tsx we logged in
      onLogin(userType);
    } catch (err) {
      setError("Login failed. Please try again.");
      console.error("Login error:", err);
    } finally {
      setIsLoading(false);
    }
  };

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
      <div className="relative z-10 w-full max-w-md">
        {/* Back Button */}
        <button
          onClick={onBackToHome}
          className="mb-4 text-gray-600 hover:text-gray-800 flex items-center gap-2"
        >
          <span>←</span> Back to Home
        </button>

        {/* Login Card */}
        <div className="bg-white/70 backdrop-blur-xl ring-1 ring-white/60 shadow-[0_20px_40px_rgba(0,0,0,0.12)] rounded-[32px] p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Welcome Back! 👋
            </h1>
            <p className="text-gray-600">Log in to continue</p>
          </div>

          {/* User Type Toggle */}
          <div className="flex gap-2 mb-6 bg-gray-100 p-1 rounded-xl">
            <button
              onClick={() => setUserType("student")}
              className={`flex-1 py-3 rounded-lg font-semibold transition-all ${
                userType === "student"
                  ? "bg-white text-[#0072FF] shadow-md"
                  : "text-gray-600"
              }`}
            >
              🎓 Student
            </button>
            <button
              onClick={() => setUserType("teacher")}
              className={`flex-1 py-3 rounded-lg font-semibold transition-all ${
                userType === "teacher"
                  ? "bg-white text-[#0072FF] shadow-md"
                  : "text-gray-600"
              }`}
            >
              👨‍🏫 Teacher
            </button>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Input */}
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

            {/* Password Input */}
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

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
                {error}
              </div>
            )}

            {/* Login Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-gradient-to-r from-[#00C6FF] to-[#0072FF] text-white text-lg font-semibold rounded-xl shadow-[0_10px_24px_rgba(38,132,255,0.35)] hover:shadow-[0_14px_32px_rgba(38,132,255,0.45)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Logging in..." : "Log In"}
            </button>
          </form>

          {/* Sign Up Link */}
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Don't have an account?{" "}
              <button
                onClick={onBackToHome}
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
