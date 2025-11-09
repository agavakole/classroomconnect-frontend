// src/pages/JoinSession.tsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { publicApi } from "../services/api";

type JoinPayload = {
  session?: {
    session_id: string;
    status?: string; // "active" | "ended" | "closed" | etc.
    // ...other fields the backend returns (survey, mood schema, etc.)
  };
  // some backends return fields at the top-level too — keep it loose
  [k: string]: any;
};

export default function JoinSession() {
  const navigate = useNavigate();
  const { joinToken: tokenFromPath } = useParams<{ joinToken: string }>();
  const [sp] = useSearchParams();

  // Raw text the user typed/pasted (could be a full URL or just the code)
  const [rawInput, setRawInput] = useState<string>(
    tokenFromPath || sp.get("code") || ""
  );

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  /** Extract a join token out of whatever was pasted/typed. */
  const token = useMemo(() => {
    const raw = (rawInput || "").trim();
    if (!raw) return "";

    // If text starts with '#', strip it (common when copying a fragment)
    const cleaned = raw.replace(/^#/, "");

    try {
      const u = new URL(cleaned);

      // ?code=<token>
      const code = u.searchParams.get("code");
      if (code) return code;

      // .../join/<token>  (prefer the segment right after the last "join")
      const parts = u.pathname.split("/").filter(Boolean);
      const idx = parts.lastIndexOf("join");
      if (idx !== -1 && parts[idx + 1]) return parts[idx + 1];

      // fallback: last non-empty path segment
      if (parts.length > 0) return parts[parts.length - 1];

      return cleaned;
    } catch {
      // Not a URL — just return what they typed
      return cleaned;
    }
  }, [rawInput]);

  /** Treat these as "active/open" states; everything else is considered closed. */
  const isActiveStatus = (s?: string) => {
    const v = String(s || "").toLowerCase();
    return v === "active" || v === "open";
  };

  /** Fetch the session by token, ensure it is active, then route home to start flow. */
  const resolveAndGo = async (t: string) => {
    try {
      setError("");
      setLoading(true);

      const payload = (await publicApi.getSession(t)) as JoinPayload;

      const status =
        String(payload?.session?.status || payload?.status || "").toLowerCase();

      if (!isActiveStatus(status)) {
        // If backend doesn’t include status when ended and instead throws 410/403,
        // we won’t get here. But if it returns 200 with status != active, block here.
        setError("This session has ended or is not available anymore.");
        return;
      }

      // Persist minimal info and continue to Home → Welcome/Survey flow
      sessionStorage.setItem(
        "session",
        JSON.stringify({ joinToken: t, session: payload.session ?? payload })
      );

      navigate("/?from=join", { replace: true });
    } catch (e: any) {
      // Common cases:
      // - 410 Gone / 403 Forbidden / 404 Not Found when session is closed/invalid
      // - network/CORS in dev
      const msg = String(e?.message || "");
      if (
        e?.status === 410 ||
        e?.status === 403 ||
        e?.status === 404 ||
        /ended|closed|expired|not\s*active/i.test(msg)
      ) {
        setError("This session has ended or the code is no longer valid.");
      } else {
        setError(msg || "Invalid or expired session code.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Auto-resolve when the page is reached via /join/:joinToken
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

        {/* Helpful hint when a full URL is pasted */}
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
