import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { authApi, clearAllAuth } from "../services/api";

export default function StudentLogin() {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      // login via AUTH api (not publicApi)
      const { access_token } = await authApi.studentLogin(email, pw);
      localStorage.setItem("student_token", access_token);
      localStorage.removeItem("teacher_token"); // ensure role is student
      nav("/student/home");
    } catch (e: any) {
      setErr(e?.message ?? "AUTH_INVALID_CREDENTIALS");
    } finally {
      setLoading(false);
    }
  }

  // Optional: joining as guest clears any tokens
  function joinAsGuest() {
    clearAllAuth();
    nav("/join");
  }

  return (
    <form onSubmit={onSubmit} className="max-w-md mx-auto p-6 rounded-2xl bg-white">
      <h1 className="text-2xl font-bold mb-4">Student Login</h1>
      <input
        className="w-full border rounded-lg px-4 py-3 mb-3"
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="email@example.com"
      />
      <input
        className="w-full border rounded-lg px-4 py-3 mb-3"
        type="password"
        required
        value={pw}
        onChange={(e) => setPw(e.target.value)}
        placeholder="••••••••"
      />
      {err && <div className="mb-3 text-red-600 text-sm">{err}</div>}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-black text-white py-3"
      >
        {loading ? "Signing in..." : "Sign in"}
      </button>

      <div className="text-center mt-4 text-sm">
        or{" "}
        <button type="button" onClick={joinAsGuest} className="underline">
          join as guest
        </button>
      </div>

      <div className="text-center mt-2 text-sm">
        No account? <Link to="/student/signup" className="underline">Sign up</Link>
      </div>
    </form>
  );
}
