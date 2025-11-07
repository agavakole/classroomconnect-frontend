import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { authApi } from "../services/api";

export default function StudentSignup() {
  const nav = useNavigate();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      // create account
      await authApi.studentSignup(email, pw, fullName);

      // (nice UX) auto-login right after signup
      const { access_token } = await authApi.studentLogin(email, pw);
      localStorage.setItem("student_token", access_token);
      localStorage.removeItem("teacher_token");

      nav("/student/home");
    } catch (e: any) {
      setErr(e?.message ?? "SIGNUP_FAILED");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="max-w-md mx-auto p-6 rounded-2xl bg-white">
      <h1 className="text-2xl font-bold mb-4">Create Student Account</h1>
      <input
        className="w-full border rounded-lg px-4 py-3 mb-3"
        type="text"
        required
        value={fullName}
        onChange={(e) => setFullName(e.target.value)}
        placeholder="Your name"
      />
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
        placeholder="Create password"
      />
      {err && <div className="mb-3 text-red-600 text-sm">{err}</div>}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-black text-white py-3"
      >
        {loading ? "Creating..." : "Sign up"}
      </button>

      <div className="text-center mt-3 text-sm">
        Already have an account? <Link to="/student/login" className="underline">Log in</Link>
      </div>
    </form>
  );
}
