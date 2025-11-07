// src/pages/TeacherSurveyDetail.tsx
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { teacherApi } from "../services/teacherApi";

type Scores = { visual: number; auditory: number; kinesthetic: number };
type Option = { id?: string; label: string; scores: Scores };
type Question = { id?: string; text: string; options: Option[] };
type Survey = {
  id: string;
  title: string;
  questions: Question[];
  creator_name?: string;
  creator_email?: string;
  created_at?: string;
};

export default function TeacherSurveyDetail() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [survey, setSurvey] = useState<Survey | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string>("");

  useEffect(() => {
    const run = async () => {
      try {
        if (!id) throw new Error("Missing survey id");
        setLoading(true);
        const data = await teacherApi.getSurveyById(id);
        setSurvey(data);
      } catch (e: any) {
        setErr(e?.message || "Failed to load survey.");
        // If unauthorized, bounce to teacher login
        if (String(e?.message || "").includes("401")) {
          navigate("/teacher/login");
        }
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-cyan-50">
        <div className="text-center">
          <div className="text-6xl mb-4">⏳</div>
          <p className="text-2xl font-bold text-gray-700">Loading survey…</p>
        </div>
      </div>
    );
  }

  if (err) {
    return (
      <div className="min-h-screen bg-red-50 flex items-center justify-center">
        <div className="max-w-lg bg-white rounded-xl p-6 shadow">
          <p className="text-red-600 font-semibold mb-4">{err}</p>
          <button
            onClick={() => navigate("/teacher/dashboard")}
            className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200"
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!survey) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{survey.title}</h1>
            {survey.creator_email && (
              <p className="text-gray-500 text-sm">
                by {survey.creator_name || "Teacher"} • {survey.creator_email}
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => navigate("/teacher/dashboard")}
              className="px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200"
            >
              ← Back
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6">
        <div className="bg-white rounded-2xl shadow p-6 space-y-6">
          {survey.questions?.length ? (
            survey.questions.map((q, qi) => (
              <div key={q.id ?? qi} className="border rounded-xl p-4">
                <h3 className="font-semibold mb-3">
                  Question {qi + 1}:{" "}
                  <span className="text-gray-700">{q.text}</span>
                </h3>
                <div className="grid md:grid-cols-3 gap-3">
                  {q.options.map((o, oi) => (
                    <div key={o.id ?? oi} className="border rounded-lg p-3">
                      <div className="font-medium">{o.label}</div>
                      <div className="text-xs text-gray-600 mt-2 grid grid-cols-3 gap-2">
                        <span>Visual: {o.scores.visual}</span>
                        <span>Auditory: {o.scores.auditory}</span>
                        <span> Kinesthetic: {o.scores.kinesthetic}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500">No questions.</p>
          )}
        </div>
      </main>
    </div>
  );
}
