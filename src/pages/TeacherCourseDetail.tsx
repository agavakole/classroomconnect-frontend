// src/pages/TeacherCourseDetail.tsx
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { teacherApi } from "../services/api";
import { getActiveSession } from "../utils/activeSession";
import { Modal } from "../components/Modal";

type Course = {
  id: string;
  title: string;
  baseline_survey_id: string;
  learning_style_categories: string[];
  mood_labels: string[];
};
type Activity = { id: string; name: string; type: string; summary: string };
type Mapping = { learning_style: string; mood: string; activity_id: string };

export default function TeacherCourseDetail() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [course, setCourse] = useState<Course | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [recommendations, setRecommendations] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadData = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const [courseData, activitiesData, recsData] = await Promise.all([
          teacherApi.getCourse(id),
          teacherApi.getActivities(),
          teacherApi.getRecommendations(id),
        ]);
        setCourse(courseData);
        setActivities(activitiesData);

        const map: Record<string, string> = {};
        recsData?.mappings?.forEach((m: any) => {
          if (m.learning_style && m.mood && m.activity?.activity_id) {
            map[`${m.learning_style}-${m.mood}`] = m.activity.activity_id;
          }
        });
        setRecommendations(map);
      } catch (e: any) {
        setError(e?.message || "Failed to load course.");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [id]);

  const handleRecommendationChange = (learningStyle: string, mood: string, activityId: string) => {
    const key = `${learningStyle}-${mood}`;
    setRecommendations((prev) => ({ ...prev, [key]: activityId }));
  };

  const handleSaveRecommendations = async () => {
    if (!id) return;
    const mappings: Mapping[] = [];
    Object.entries(recommendations).forEach(([key, activity_id]) => {
      const [learning_style, mood] = key.split("-");
      if (activity_id) mappings.push({ learning_style, mood, activity_id });
    });

    try {
      setSaving(true);
      await teacherApi.updateRecommendations(id, mappings);
      alert("✅ Recommendations saved successfully!");
    } catch (e: any) {
      alert("Failed to save: " + (e?.message || ""));
    } finally {
      setSaving(false);
    }
  };

  const active = getActiveSession();

  return (
    <Modal
      isOpen={true}
      onClose={() => navigate(-1)}
      title="Course"
      size="xl"
    >
      {loading ? (
        <div className="text-gray-700">Loading…</div>
      ) : error || !course ? (
        <div>
          <p className="text-red-600 font-semibold mb-4">
            {error || "Course not found"}
          </p>
          <div className="flex justify-end">
            <button
              onClick={() => navigate(-1)}
              className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200"
            >
              Close
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Title + actions */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
                {course.title}
              </h1>
              <p className="text-gray-700">
                Baseline survey:{" "}
                <span className="font-mono text-sm">
                  {course.baseline_survey_id.slice(0, 8)}…
                </span>
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={handleSaveRecommendations}
                disabled={saving}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#00C6FF] to-[#0072FF] text-white font-semibold shadow-[0_10px_20px_rgba(38,132,255,0.35)] hover:shadow-[0_14px_28px_rgba(38,132,255,0.45)] transition"
              >
                {saving ? "Saving…" : "Save Recommendations"}
              </button>
              <button
                onClick={() => navigate(`/teacher/courses/${id}/session`)}
                className="px-4 py-2 rounded-xl bg-white border-2 border-gray-200 hover:border-[#0072FF] font-semibold transition"
              >
                Open Session View
              </button>
            </div>
          </div>

          {/* Active session strip */}
          {active && active.course_id === id && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-emerald-800">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold">Active session</div>
                  <div className="text-sm">
                    ID: <code>{active.session_id}</code> • Join:{" "}
                    <code>{active.join_token}</code>
                  </div>
                </div>
                <button
                  onClick={() => navigate(`/teacher/sessions/${active.session_id}/results`)}
                  className="px-3 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
                >
                  View Results
                </button>
              </div>
            </div>
          )}

          {/* Course info */}
          <section className="bg-white ring-1 ring-gray-200 rounded-3xl shadow-sm p-6 sm:p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Course Information</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-600">Learning Styles</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {course.learning_style_categories.map((style) => (
                    <span
                      key={style}
                      className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium capitalize"
                    >
                      {style}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-600">Mood Labels</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {course.mood_labels.map((mood) => (
                    <span
                      key={mood}
                      className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium capitalize"
                    >
                      {mood}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Recommendations table */}
          <section className="bg-white ring-1 ring-gray-200 rounded-3xl shadow-sm p-6 sm:p-8">
            <div className="mb-4">
              <h2 className="text-xl font-bold text-gray-900">Activity Recommendations</h2>
              <p className="text-sm text-gray-600">
                Choose which activity to show for each learning style + mood combination.
              </p>
            </div>

            {activities.length === 0 ? (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-yellow-800">
                  No activities available. Please{" "}
                  <button
                    onClick={() => navigate("/teacher/activities/create")}
                    className="text-[#0072FF] underline"
                  >
                    create activities
                  </button>{" "}
                  first.
                </p>
              </div>
            ) : (
              <div className="relative overflow-x-auto">
                <table className="w-full border-separate border-spacing-0 text-sm">
                  <thead>
                    <tr>
                      <th className="sticky left-0 z-10 bg-white font-semibold text-left p-3 ring-1 ring-gray-200 rounded-l-xl">
                        Learning Style / Mood
                      </th>
                      {course.mood_labels.map((mood, i, arr) => (
                        <th
                          key={mood}
                          className={`p-3 text-center font-semibold capitalize bg-gray-100 ring-1 ring-gray-200 ${
                            i === arr.length - 1 ? "rounded-r-xl" : ""
                          }`}
                        >
                          {mood}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {course.learning_style_categories.map((style) => (
                      <tr key={style}>
                        <td className="sticky left-0 z-10 bg-white font-semibold p-3 ring-1 ring-gray-200 capitalize">
                          {style === "visual" && "👁️ Visual"}
                          {style === "auditory" && "🎧 Auditory"}
                          {style === "kinesthetic" && "✋ Kinesthetic"}
                          {!["visual", "auditory", "kinesthetic"].includes(style) && style}
                        </td>
                        {course.mood_labels.map((mood, i, arr) => {
                          const key = `${style}-${mood}`;
                          const selected = recommendations[key] || "";
                          const rounded = i === arr.length - 1 ? "rounded-r-xl" : "";
                          return (
                            <td key={mood} className={`p-2 ring-1 ring-gray-200 ${rounded}`}>
                              <select
                                value={selected}
                                onChange={(e) =>
                                  handleRecommendationChange(style, mood, e.target.value)
                                }
                                className="w-full px-2 py-2 rounded border-2 border-gray-200 focus:border-[#0072FF] outline-none"
                              >
                                <option value="">-- No activity --</option>
                                {activities.map((a) => (
                                  <option key={a.id} value={a.id}>
                                    {a.name} ({a.type})
                                  </option>
                                ))}
                              </select>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex gap-2">
                <span className="text-2xl">💡</span>
                <div>
                  <p className="font-semibold text-blue-900 mb-1">How it works</p>
                  <p className="text-blue-800">
                    After a student completes the survey, we compute a learning style and
                    combine it with the mood they selected to choose the activity you configured here.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <div className="pt-2 flex justify-end">
            <button
              onClick={() => navigate(-1)}
              className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}
