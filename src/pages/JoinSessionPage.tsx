import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { publicApi } from "../services/api";

export default function JoinSession() {
  const navigate = useNavigate();
  const { joinToken: tokenFromPath } = useParams<{ joinToken: string }>();
  const [sp] = useSearchParams();

  const [rawInput, setRawInput] = useState<string>(
    tokenFromPath || sp.get("code") || ""
  );
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Extract token if the user pastes a full QR URL
  const token = useMemo(() => {
  const raw = (rawInput || "").trim();
  if (!raw) return "";

  // If text starts with '#', strip it (common when copying a fragment)
  const cleaned = raw.replace(/^#/, "");

  try {
    const u = new URL(cleaned);

    // 1) ?code=<token>
    const code = u.searchParams.get("code");
    if (code) return code;

    // 2) .../join/<token> (find the last "join" segment and take what follows)
    const parts = u.pathname.split("/").filter(Boolean);
    const idx = parts.lastIndexOf("join");
    if (idx !== -1 && parts[idx + 1]) return parts[idx + 1];

    // 3) fallback: last non-empty path segment
    if (parts.length > 0) return parts[parts.length - 1];

    // 4) fallback to original string
    return cleaned;
  } catch {
    // Not a URL — return cleaned as typed (keep case)
    return cleaned;
  }
}, [rawInput]);

  const resolveAndGo = async (t: string) => {
    try {
      setError("");
      setLoading(true);
      const session = await publicApi.getSession(t);
      sessionStorage.setItem("session", JSON.stringify({ joinToken: t, session }));
      navigate("/?from=join", { replace: true });
    } catch (e: any) {
      setError(e?.message || "Invalid or expired session code.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (tokenFromPath) {
      setRawInput(tokenFromPath);
      resolveAndGo(tokenFromPath);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tokenFromPath]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#E6F6FF] px-4">
      <div className="bg-white/90 rounded-2xl p-8 shadow max-w-lg w-full">
        <button
          onClick={() => navigate("/")}
          className="mb-4 text-gray-600 hover:text-gray-800 flex items-center gap-2"
        >
          <span>←</span> Back to Home
        </button>

        <h1 className="text-2xl font-bold mb-2">Join a Session</h1>
        <p className="text-gray-600 mb-6">
          Paste the QR link or type the 6-character code from your teacher.
        </p>

        <div className="space-y-3">
          <input
            value={rawInput}
            onChange={(e) => setRawInput(e.target.value)}
            placeholder="Paste QR link or type code e.g. 7F9K2A"
            className="w-full px-4 py-3 rounded-xl border"
          />
          <button
            onClick={() => token && resolveAndGo(token)}
            disabled={!token || loading}
            className="w-full py-3 rounded-xl bg-black text-white disabled:opacity-60"
          >
            {loading ? "Joining..." : "Join"}
          </button>
        </div>

        {token && rawInput && token !== rawInput.trim() && (
          <p className="text-xs text-gray-500 mt-2">
            Detected token: <span className="font-mono">{token}</span>
          </p>
        )}

        {error && (
          <div className="mt-4 text-sm bg-red-50 text-red-700 border border-red-200 rounded-lg px-3 py-2">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
