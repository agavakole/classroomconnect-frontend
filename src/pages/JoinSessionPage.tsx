// src/pages/JoinSessionPage.tsx
import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { publicApi } from "../services/api";

export default function JoinSession() {
  const navigate = useNavigate();
  const { joinToken: tokenFromPath } = useParams<{ joinToken: string }>();
  const [sp] = useSearchParams();

  const [code, setCode] = useState<string>(
    tokenFromPath || sp.get("code") || ""
  );
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const resolveAndGo = async (token: string) => {
    try {
      setError("");
      setLoading(true);

      // DO NOT clear tokens here — keep student logged in
      const session = await publicApi.getSession(token);

      // Save for App + Survey
      sessionStorage.setItem(
        "session",
        JSON.stringify({ joinToken: token, session })
      );

      // Send back to App; App decides welcome vs survey
      navigate("/?from=join", { replace: true });
    } catch (e: any) {
      setError(e?.message || "Invalid or expired session code.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (tokenFromPath) {
      setCode(tokenFromPath);
      resolveAndGo(tokenFromPath);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tokenFromPath]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#E6F6FF] px-4">
      <div className="bg-white/90 rounded-2xl p-8 shadow max-w-md w-full">
        <h1 className="text-2xl font-bold mb-2">Join a Session</h1>
        <p className="text-gray-600 mb-6">
          Enter the code from your teacher or scan their QR.
        </p>

        <div className="flex gap-2 mb-3">
          <input
            value={code}
            onChange={(e) => setCode(e.target.value.trim())}
            placeholder="e.g. 7F9K2A"
            className="flex-1 px-4 py-3 rounded-lg border"
          />
          <button
            onClick={() => code && resolveAndGo(code)}
            disabled={!code || loading}
            className="px-4 py-3 rounded-lg bg-black text-white disabled:opacity-60"
          >
            {loading ? "Joining..." : "Join"}
          </button>
        </div>

        {error && (
          <div className="mt-2 text-sm bg-red-50 text-red-700 border border-red-200 rounded-lg px-3 py-2">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
