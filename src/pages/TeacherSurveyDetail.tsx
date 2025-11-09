// src/pages/TeacherSurveyDetail.tsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { teacherApi } from "../services/api";

/** ---- Minimal shapes so we don’t overfit to backend internals ---- */
type Activity = {
  id: string;
  name: string;
  summary?: string;
  type?: string;
};

type Survey = {
  id: string;
  title: string;
  course_id?: string;
  // these two may be on the survey or resolvable from the backend
  learning_styles?: string[]; // e.g., ["Active Learner","Passive Learner","Structured Learner"]
  mood_labels?: string[]; // e.g., ["Energized","Curious","Tired"]
};

type RecMappings = Record<string, Record<string, string | null>>;
// { [learningStyle]: { [moodLabel]: activityId|null } }

/** Utility */
const toArray = (v: any): string[] =>
  Array.isArray(v) ? v.filter(Boolean).map(String) : [];

const glass =
  "bg-white/70 backdrop-blur-xl border border-white/60 shadow-[0_12px_40px_rgba(15,23,42,0.08)]";

/** ---- Component ---- */
export default function TeacherSurveyDetail() {
  const { surveyId } = useParams<{ surveyId: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [survey, setSurvey] = useState<Survey | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [moods, setMoods] = useState<string[]>([]);
  const [styles, setStyles] = useState<string[]>([]);
  const [matrix, setMatrix] = useState<RecMappings>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /** Fetch all page data */
  useEffect(() => {
    let alive = true;
    (async () => {
      if (!surveyId) return;
      setLoading(true);
      setError(null);
      try {
        // 1) survey detail
        const sv: Survey = await teacherApi.getSurveyById(surveyId);
        if (!alive) return;

        setSurvey(sv);
        const ls = toArray(sv.learning_styles);
        const md = toArray(sv.mood_labels);

        // fallbacks (still render an empty mapping section instead of crashing)
        setStyles(ls.length ? ls : []);
        setMoods(md.length ? md : []);

        // 2) activities for dropdowns
        const acts: Activity[] = await teacherApi.getActivities();
        if (!alive) return;
        setActivities(Array.isArray(acts) ? acts : []);

        // 3) recommendations (attached to the course)
        if (sv.course_id) {
          const rec = await teacherApi.getRecommendations(sv.course_id);
          if (!alive) return;

          // The endpoint usually returns: { mappings: { [style]: { [mood]: activity_id } } }
          // Normalize and ensure all cells exist in our local state:
          const incoming: RecMappings = (rec?.mappings ?? {}) as RecMappings;
          setMatrix(ensureAllCells(ls, md, incoming));
        } else {
          setMatrix(ensureAllCells(ls, md, {}));
        }
      } catch (e: any) {
        setError(e?.message ?? "Failed to load survey.");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [surveyId]);

  /** Build options once */
  const activityOptions = useMemo(
    () =>
      [{ id: "", name: "-- No activity --" }, ...activities].map((a) => ({
        value: a.id,
        label: a.name,
      })),
    [activities]
  );

  /** Setter for a single cell */
  const setCell = (styleName: string, moodName: string, activityId: string) => {
    setMatrix((prev) => ({
      ...prev,
      [styleName]: {
        ...(prev[styleName] ?? {}),
        [moodName]: activityId || null,
      },
    }));
  };

  /** Save to backend */
  const onSave = async () => {
    if (!survey?.course_id) {
      alert("No course is connected to this survey yet.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await teacherApi.updateRecommendations(survey.course_id, matrix);
      alert("✅ Recommendations saved.");
    } catch (e: any) {
      setError(e?.message ?? "Failed to save.");
    } finally {
      setSaving(false);
    }
  };

  /** Start a session from this survey’s course (if your app does this here) */
  const onStartSession = async () => {
    if (!survey?.course_id) {
      alert("You need a course to start a session.");
      return;
    }
    try {
      const sess = await teacherApi.createSession(survey.course_id, true);
      // Keep teacher on dashboard; don’t navigate to a non-existent route.
      alert(`Session started. Join token: ${sess?.join_token ?? "—"}`);
    } catch (e: any) {
      alert(e?.message ?? "Could not start session.");
    }
  };

  /* -------------------- Render -------------------- */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        Loading…
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className={`max-w-xl w-full p-6 rounded-2xl ${glass}`}>
          <div className="text-red-600 font-semibold mb-2">Error</div>
          <p className="text-gray-700">{error}</p>
          <div className="mt-4">
            <button
              onClick={() => navigate(-1)}
              className="px-4 py-2 rounded-lg bg-gray-900 text-white"
            >
              Go back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen px-4 py-6 md:px-6 md:py-8"
      style={{
        background:
          "radial-gradient(1200px 600px at -20% -10%, #E0F2FE 0%, transparent 60%), radial-gradient(1000px 500px at 120% -10%, #F5F3FF 0%, transparent 60%), linear-gradient(180deg, #F8FAFC, #EEF2FF)",
      }}
    >
      {/* Header bar */}
      <div className="max-w-6xl mx-auto mb-6 flex items-center justify-between">
        <div>
          <button
            onClick={() => navigate("/teacher/dashboard")}
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            ← Dashboard
          </button>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mt-2">
            {survey?.title || "Survey"}
          </h1>
          <p className="text-gray-500 text-sm">
            Survey ID: <span className="font-mono">{survey?.id}</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onStartSession}
            className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700"
          >
            Start Session
          </button>
        </div>
      </div>

      {/* Course / labels */}
      <div className="max-w-6xl mx-auto mb-8 p-5 rounded-2xl bg-white/60 backdrop-blur border border-white">
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <div className="text-gray-800 font-bold mb-2">Learning Styles</div>
            <div className="flex flex-wrap gap-2">
              {styles.length ? (
                styles.map((s) => (
                  <span
                    key={s}
                    className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-sm font-semibold"
                  >
                    {s}
                  </span>
                ))
              ) : (
                <span className="text-gray-500">None configured.</span>
              )}
            </div>
          </div>
          <div>
            <div className="text-gray-800 font-bold mb-2">Mood Labels</div>
            <div className="flex flex-wrap gap-2">
              {moods.length ? (
                moods.map((m) => (
                  <span
                    key={m}
                    className="px-3 py-1 rounded-full bg-purple-50 text-purple-700 text-sm font-semibold"
                  >
                    {m}
                  </span>
                ))
              ) : (
                <span className="text-gray-500">None configured.</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Recommendation Matrix */}
      <div className="max-w-6xl mx-auto">
        <div className={`rounded-2xl p-5 md:p-6 ${glass}`}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-extrabold text-gray-900">
              Activity Recommendations
            </h2>
            <button
              disabled={saving}
              onClick={onSave}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 disabled:opacity-60"
            >
              <span className="text-lg">💾</span>
              {saving ? "Saving…" : "Save Recommendations"}
            </button>
          </div>

          <p className="text-gray-600 mb-4">
            Choose which activity to show for each learning style × mood
            combination.
          </p>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr>
                  <th className="text-left py-3 px-3 text-gray-700">
                    Learning Style / Mood
                  </th>
                  {moods.map((m) => (
                    <th key={m} className="text-left py-3 px-3 text-gray-700">
                      {m}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {styles.map((styleName) => (
                  <tr key={styleName} className="border-t border-gray-100/70">
                    <td className="py-3 px-3 font-semibold text-gray-800">
                      {styleName}
                    </td>
                    {moods.map((mood) => {
                      const current = matrix[styleName]?.[mood] ?? "";
                      return (
                        <td
                          key={`${styleName}:${mood}`}
                          className="py-2.5 px-3"
                        >
                          <select
                            value={current ?? ""}
                            onChange={(e) =>
                              setCell(styleName, mood, e.target.value)
                            }
                            className="w-full rounded-lg border-gray-200 focus:border-indigo-500 focus:ring-indigo-500"
                          >
                            {activityOptions.map((opt) => (
                              <option
                                key={`${mood}-${styleName}-${opt.value}`}
                                value={opt.value}
                              >
                                {opt.label}
                              </option>
                            ))}
                          </select>
                        </td>
                      );
                    })}
                  </tr>
                ))}
                {!styles.length && (
                  <tr>
                    <td
                      colSpan={Math.max(1, moods.length + 1)}
                      className="py-6 text-gray-500"
                    >
                      No learning styles available. Configure them on this
                      survey/course first.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* How it works */}
          <div className="mt-6 rounded-xl p-4 bg-sky-50 border border-sky-100 text-sky-900">
            <div className="font-semibold mb-1">How it works</div>
            <p className="text-sm">
              When a student completes the survey, we compute a learning style
              and use the mood they selected to pick your configured activity.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Ensure every [style][mood] cell exists so the UI never shows “undefined” */
function ensureAllCells(
  styles: string[],
  moods: string[],
  incoming: RecMappings
): RecMappings {
  const out: RecMappings = { ...incoming };
  styles.forEach((s) => {
    out[s] = out[s] ?? {};
    moods.forEach((m) => {
      if (typeof out[s][m] === "undefined") out[s][m] = null;
    });
  });
  return out;
}
