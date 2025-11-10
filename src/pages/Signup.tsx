// src/pages/Signup.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authApi } from "../services/api";

/**
 * Unified signup page for both students and teachers
 * 
 * Features:
 * - Toggle between student/teacher signup
 * - Form validation (password match, minimum length)
 * - Automatic login after successful signup
 * - Auto-redirect to appropriate dashboard
 * 
 * Backend connections:
 * - POST /api/students/signup - Create student account
 * - POST /api/teachers/signup - Create teacher account
 * - POST /api/students/login - Auto-login student after signup
 * - POST /api/teachers/login - Auto-login teacher after signup
 * 
 * Flow:
 * 1. User fills form and selects role (student/teacher)
 * 2. Frontend validates passwords match
 * 3. Backend creates account
 * 4. Frontend immediately logs in with same credentials
 * 5. Saves auth token to localStorage
 * 6. Redirects to appropriate dashboard
 */
export function Signup() {
  const navigate = useNavigate();

  // Form state
  const [name, setName] = useState(""); // Full name for profile
  const [email, setEmail] = useState(""); // Email (unique identifier)
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState(""); // For validation
  const [userType, setUserType] = useState<"student" | "teacher">("student"); // Role selection

  // UI state
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Handles form submission
   * 
   * Steps:
   * 1. Validate passwords match and meet requirements
   * 2. Call appropriate signup endpoint (student vs teacher)
   * 3. Automatically log in the new user
   * 4. Store auth token in localStorage
   * 5. Store user_type for quick role detection
   * 6. Redirect to appropriate dashboard
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Frontend validation
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
        // STUDENT SIGNUP FLOW
        // 1. Create account: POST /api/students/signup
        await authApi.studentSignup(email, password, name);
        
        // 2. Auto-login: POST /api/students/login
        const { access_token } = await authApi.studentLogin(email, password);
        
        // 3. Store credentials
        localStorage.setItem("student_token", access_token); // For API auth
        localStorage.setItem("user_type", "student"); // For role detection
        
        // 4. Redirect to student dashboard
        navigate("/student/home", { replace: true });
      } else {
        // TEACHER SIGNUP FLOW
        // 1. Create account: POST /api/teachers/signup
        await authApi.teacherSignup(email, password, name);
        
        // 2. Auto-login: POST /api/teachers/login
        const { access_token } = await authApi.teacherLogin(email, password);
        
        // 3. Store credentials
        localStorage.setItem("teacher_token", access_token);
        localStorage.setItem("user_type", "teacher");
        
        // 4. Redirect to teacher dashboard
        navigate("/teacher/dashboard", { replace: true });
      }
    } catch (err: any) {
      // Display backend error message
      // Common errors: email already exists, invalid format, server error
      setError(err?.message || "Signup failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen bg-[#E6F6FF] relative flex items-center justify-center px-4
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
      <div className="relative z-10 w-full max-w-md">
        {/* Back to home button */}
        <button
          onClick={() => navigate("/")}
          className="mb-4 text-gray-600 hover:text-gray-800 flex items-center gap-2"
        >
          <span>←</span> Back to Home
        </button>

        {/* Signup form card - frosted glass effect */}
        <div className="bg-white/70 backdrop-blur-xl ring-1 ring-white/60 shadow-[0_20px_40px_rgba(0,0,0,0.12)] rounded-[32px] p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Create Account ✨
            </h1>
            <p className="text-gray-600">Join ClassroomConnect today</p>
          </div>

          {/* Role toggle - student vs teacher */}
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

          {/* Signup form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full name input */}
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

            {/* Email input */}
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

            {/* Password input */}
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
                minLength={6} // HTML5 validation backup
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#0072FF] focus:outline-none transition-colors"
              />
            </div>

            {/* Confirm password input */}
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

            {/* Error message display */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
                {error}
              </div>
            )}

            {/* Submit button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-gradient-to-r from-[#00C6FF] to-[#0072FF] text-white text-lg font-semibold rounded-xl shadow-[0_10px_24px_rgba(38,132,255,0.35)] hover:shadow-[0_14px_32px_rgba(38,132,255,0.45)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Creating Account..." : "Sign Up"}
            </button>
          </form>

          {/* Link to login page */}
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