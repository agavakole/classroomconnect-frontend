import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { QRCodeCanvas } from "qrcode.react";
import { teacherApi } from "../services/teacherApi";
import {
  getActiveSession,
  setActiveSession,
  clearActiveSession,
} from "../utils/activeSession";
import type { ActiveSession } from "../utils/activeSession";

type CreatedSession = {
  session_id: string;
  join_token: string;
  require_survey: boolean;
  status: string;
};

export default function StartSessionPage() {
  const { id: courseId } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [requireSurvey, setRequireSurvey] = useState(true);
  const [session, setSession] = useState<CreatedSession | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  // restore if we came back
  useEffect(() => {
    const a = getActiveSession();
    if (a && a.course_id === courseId) {
      setSession({
        session_id: a.session_id,
        join_token: a.join_token,
        require_survey: !!a.require_survey,
        status: "active",
      });
    }
  }, [courseId]);

  const joinUrl = useMemo(() => {
    if (!session?.join_token) return "";
    return `${window.location.origin}/join/${session.join_token}`;
  }, [session?.join_token]);

  const handleStart = async () => {
    if (!courseId) return;
    try {
      setErr("");
      setLoading(true);
      const data = await teacherApi.createSession(courseId, requireSurvey);
      setSession(data);

      // persist so we can always find this exact session again
      setActiveSession({
        session_id: data.session_id,
        join_token: data.join_token,
        course_id: courseId,
        require_survey: data.require_survey,
        created_at: new Date().toISOString(),
      });
    } catch (e: any) {
      setErr(e?.message || "Failed to start session");
    } finally {
      setLoading(false);
    }
  };

  const handleEnd = () => {
    setSession(null);
    clearActiveSession();
    alert("Session cleared locally.");
  };

  const copyLink = async () => {
    if (!joinUrl) return;
    await navigator.clipboard.writeText(joinUrl);
    alert("Join link copied!");
  };

  return (
    <div className="min-h-screen bg-[#F7FAFF]">
      <header className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Start Session — Course</h1>
          <button
            onClick={() => navigate(`/teacher/courses/${courseId}`)}
            className="px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200"
          >
            ← Course
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6">
        {err && (
          <div className="mb-4 bg-red-50 text-red-700 border border-red-200 px-4 py-3 rounded-lg">
            {err}
          </div>
        )}

        <div className="bg-white rounded-2xl shadow p-6 grid md:grid-cols-2 gap-8">
          <div>
            <label className="flex items-center gap-2 mb-4">
              <input
                type="checkbox"
                checked={requireSurvey}
                onChange={(e) => setRequireSurvey(e.target.checked)}
              />
              <span className="font-semibold">
                Require baseline survey during this session
              </span>
            </label>

            <div className="flex gap-3 mb-4">
              <button
                onClick={handleStart}
                disabled={loading}
                className="px-5 py-3 rounded-xl bg-black text-white font-semibold disabled:opacity-60"
              >
                {loading ? "Starting..." : "▶ Start Session"}
              </button>

              <button
                onClick={() =>
                  session?.session_id &&
                  navigate(`/teacher/sessions/${session.session_id}/results`)
                }
                disabled={!session}
                className="px-5 py-3 rounded-xl bg-gray-100 hover:bg-gray-200 disabled:opacity-60"
              >
                📊 View Results
              </button>

              <button
                onClick={handleEnd}
                disabled={!session}
                className="px-5 py-3 rounded-xl bg-rose-100 text-rose-700 disabled:opacity-60"
              >
                ⛔ End Session
              </button>
            </div>

            {/* Join link */}
            <div className="mb-6">
              <div className="text-sm text-gray-600 mb-1">Join link</div>
              <div className="flex gap-2">
                <input
                  readOnly
                  value={joinUrl || "— start a session to generate link —"}
                  className="flex-1 px-3 py-2 rounded-lg border"
                />
                <button
                  onClick={copyLink}
                  disabled={!joinUrl}
                  className="px-3 py-2 rounded-lg bg-gray-100"
                >
                  Copy
                </button>
                <a
                  href={joinUrl || "#"}
                  target="_blank"
                  rel="noreferrer"
                  className={`px-3 py-2 rounded-lg ${
                    joinUrl
                      ? "bg-gray-100 hover:bg-gray-200"
                      : "bg-gray-100 opacity-60 pointer-events-none"
                  }`}
                >
                  Open
                </a>
              </div>
            </div>

            {session && (
              <p className="text-sm text-gray-500">
                Session ID:{" "}
                <span className="font-mono">{session.session_id}</span>
              </p>
            )}
          </div>

          {/* QR Code */}
          <div>
            <div className="text-sm text-gray-600 mb-2">QR Code</div>
            <div className="border rounded-xl p-4 flex items-center justify-center min-h-[300px]">
              {joinUrl ? (
                <QRCodeCanvas value={joinUrl} size={260} includeMargin />
              ) : (
                <span className="text-gray-400">
                  Start a session to show QR
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="mt-6 bg-blue-50 text-blue-800 border border-blue-200 rounded-xl p-4">
          💡 Students scan the QR or open the join link. Logged-in students
          submit with their token; guests must provide a name.
        </div>
      </main>
    </div>
  );
}
