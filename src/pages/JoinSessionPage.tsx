// src/pages/JoinSessionPage.tsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { publicApi } from "../services/api";

export default function JoinSession() {
  const navigate = useNavigate();
  const { joinToken: tokenFromPath } = useParams<{ joinToken: string }>();
  const [sp] = useSearchParams();

  const cameFromScanner = sp.get("scanner") === "1";
  const [rawInput, setRawInput] = useState<string>(tokenFromPath || sp.get("code") || "");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Extract token if the user pastes a full QR URL
  const token = useMemo(() => {
    const trimmed = (rawInput || "").trim();
    if (!trimmed) return "";

    // 1) If the input looks like a URL … try to extract /join/<token>
    try {
      const u = new URL(trimmed);
      // handle /join/<token> or /join?code=<token>
      const pathParts = u.pathname.split("/").filter(Boolean);
      if (pathParts[0] === "join" && pathParts[1]) return pathParts[1];
      const qCode = u.searchParams.get("code");
      if (qCode) return qCode;
    } catch {
      // not a URL → fall back to “as typed”
    }

    // 2) Otherwise assume it’s a plain code
    return trimmed.toUpperCase();
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
          {cameFromScanner
            ? "If you’re on a phone, scanning a QR will usually open this page with the code filled in. You can also paste the QR link below, or just type the 6-digit code."
            : "Enter the code from your teacher — or paste the QR link here."}
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

        <div className="mt-6 rounded-xl bg-gray-50 border p-4 text-sm text-gray-600">
          <div className="font-semibold mb-1">How QR works</div>
          <ul className="list-disc pl-5 space-y-1">
            <li>On phones, open the Camera and point at the classroom screen.</li>
            <li>It opens this site with the session token pre-filled.</li>
            <li>No camera? Just type the code your teacher shows.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
