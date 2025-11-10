// src/pages/JoinSessionPage.tsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { publicApi } from "../services/api";

/**
 * Type for backend response when resolving join token
 */
type JoinPayload = {
  session?: {
    session_id: string;
    status?: string; // "active" | "ended" | "closed"
    // ...other session details (survey, mood_check_schema, etc.)
  };
  [k: string]: any; // Backend may return additional top-level fields
};

/**
 * Join session page - handles QR scanning and code entry
 * 
 * Features:
 * - Accept join token via URL parameter (/join/:joinToken)
 * - Accept full URLs pasted by users
 * - Extract token from various URL formats
 * - Validate session is active before proceeding
 * 
 * Backend connection:
 * - GET /api/public/join/{joinToken} - Resolve token to session
 * 
 * Flow:
 * 1. Student scans QR or types code
 * 2. Frontend extracts token from URL/text
 * 3. Backend validates token and returns session data
 * 4. Frontend stores session data in sessionStorage
 * 5. Redirects to / with ?from=join flag
 * 6. App.tsx picks up flag and shows Welcome/Survey
 * 
 * Supported input formats:
 * - Direct token: "7F9K2A"
 * - Full URL: "https://yoursite.com/join/7F9K2A"
 * - With query: "https://yoursite.com/join?code=7F9K2A"
 * - With hash: "#7F9K2A" (common when copying fragments)
 */
export default function JoinSession() {
  const navigate = useNavigate();
  const { joinToken: tokenFromPath } = useParams<{ joinToken: string }>(); // From /join/:token
  const [sp] = useSearchParams(); // Query params like ?code=ABC123

  // Raw text the user typed/pasted (could be full URL or just code)
  const [rawInput, setRawInput] = useState<string>(
    tokenFromPath || sp.get("code") || ""
  );

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  /**
   * Extracts join token from various input formats
   * 
   * Handles:
   * - Plain codes: "7F9K2A"
   * - Full URLs: "https://site.com/join/7F9K2A"
   * - Query params: "https://site.com/join?code=7F9K2A"
   * - Hash fragments: "#7F9K2A"
   * 
   * Returns cleaned token string
   */
  const token = useMemo(() => {
    const raw = (rawInput || "").trim();
    if (!raw) return "";

    // Strip leading hash if present (common when copying URL fragments)
    const cleaned = raw.replace(/^#/, "");

    try {
      // Try parsing as URL
      const u = new URL(cleaned);

      // Check for ?code= query parameter
      const code = u.searchParams.get("code");
      if (code) return code;

      // Extract from path: /join/<token>
      const parts = u.pathname.split("/").filter(Boolean);
      const idx = parts.lastIndexOf("join");
      if (idx !== -1 && parts[idx + 1]) return parts[idx + 1];

      // Fallback: last path segment
      if (parts.length > 0) return parts[parts.length - 1];

      return cleaned;
    } catch {
      // Not a valid URL - return as-is (probably just a code)
      return cleaned;
    }
  }, [rawInput]);

  /**
   * Checks if session status indicates it's still accepting joins
   * Treats "active" and "open" as valid
   * Everything else is considered closed
   */
  const isActiveStatus = (s?: string) => {
    const v = String(s || "").toLowerCase();
    return v === "active" || v === "open";
  };

  /**
   * Resolves join token and validates session is active
   * Backend: GET /api/public/join/{token}
   * 
   * Success flow:
   * 1. Backend returns session data
   * 2. Check status is "active"
   * 3. Store session in sessionStorage
   * 4. Redirect to / with ?from=join flag
   * 5. App.tsx routes to Welcome (guest) or Survey (logged-in)
   * 
   * Error cases:
   * - 410 Gone: Session ended
   * - 403 Forbidden: Session closed/invalid
   * - 404 Not Found: Token doesn't exist
   * - Network errors
   */
  const resolveAndGo = async (t: string) => {
    try {
      setError("");
      setLoading(true);

      // Backend: GET /api/public/join/{joinToken}
      const payload = (await publicApi.getSession(t)) as JoinPayload;

      // Check session status
      const status =
        String(payload?.session?.status || payload?.status || "").toLowerCase();

      if (!isActiveStatus(status)) {
        // Backend returned 200 but session is not active
        setError("This session has ended or is not available anymore.");
        return;
      }

      // Store session data for App.tsx to pick up
      // Contains: joinToken, session (with survey, mood_check_schema, etc.)
      sessionStorage.setItem(
        "session",
        JSON.stringify({ joinToken: t, session: payload.session ?? payload })
      );

      // Redirect to home with flag indicating we came from join
      // App.tsx checks this flag and routes to Welcome/Survey
      navigate("/?from=join", { replace: true });
    } catch (e: any) {
      // Handle various error scenarios
      const msg = String(e?.message || "");
      
      // Session ended or invalid token
      if (
        e?.status === 410 || // Gone (ended)
        e?.status === 403 || // Forbidden (closed)
        e?.status === 404 || // Not found
        /ended|closed|expired|not\s*active/i.test(msg)
      ) {
        setError("This session has ended or the code is no longer valid.");
      } else {
        // Other errors (network, CORS, etc.)
        setError(msg || "Invalid or expired session code.");
      }
    } finally {
      setLoading(false);
    }
  };

  /**
   * Auto-resolve when page loaded via /join/:joinToken URL
   * Happens when student scans QR code
   */
  useEffect(() => {
    if (tokenFromPath) {
      setRawInput(tokenFromPath);
      resolveAndGo(tokenFromPath);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tokenFromPath]);

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
      {/* Join form card */}
      <div className="bg-white/90 rounded-2xl p-8 shadow max-w-lg w-full">
        {/* Back button */}
        <button
          onClick={() => navigate("/")}
          className="mb-4 text-gray-600 hover:text-gray-800 flex items-center gap-2"
        >
          <span>←</span> Back to Home
        </button>

        {/* Header */}
        <h1 className="text-2xl font-bold mb-2">Join a Session</h1>
        <p className="text-gray-600 mb-6">
          Paste the QR link or type the 6-character code from your teacher.
        </p>

        {/* Input and submit */}
        <div className="space-y-3">
          {/* Token/URL input field */}
          <input
            value={rawInput}
            onChange={(e) => setRawInput(e.target.value)}
            placeholder="Paste QR link or type code e.g. 7F9K2A"
            className="w-full px-4 py-3 rounded-xl border"
          />
          
          {/* Join button */}
          <button
            onClick={() => token && resolveAndGo(token)}
            disabled={!token || loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-[#00C6FF] to-[#0072FF] text-white disabled:opacity-60"
          >
            {loading ? "Joining..." : "Join"}
          </button>
        </div>

        {/* Helpful hint when full URL is pasted
            Shows extracted token so user knows what's being used */}
        {token && rawInput && token !== rawInput.trim() && (
          <p className="text-xs text-gray-500 mt-2">
            Detected token: <span className="font-mono">{token}</span>
          </p>
        )}

        {/* Error message display */}
        {error && (
          <div className="mt-4 text-sm bg-red-50 text-red-700 border border-red-200 rounded-lg px-3 py-2">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}