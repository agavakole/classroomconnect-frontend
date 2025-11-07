import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { teacherApi } from "../services/teacherApi";
import { getActiveSession } from "../utils/activeSession";

type Course = {
  id: string;
  title: string;
  baseline_survey_id: string;
  learning_style_categories: string[];
  mood_labels: string[];
};

type Activity = {
  id: string;
  name: string;
  type: string;
  summary: string;
};

type Mapping = {
  learning_style: string;
  mood: string;
  activity_id: string;
};

export default function TeacherCourseDetail() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [course, setCourse] = useState<Course | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [recommendations, setRecommendations] = useState<
    Record<string, string>
  >({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  
  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

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

      const recsMap: Record<string, string> = {};
      if (recsData?.mappings) {
        recsData.mappings.forEach((m: any) => {
          if (m.learning_style && m.mood && m.activity?.activity_id) {
            recsMap[`${m.learning_style}-${m.mood}`] = m.activity.activity_id;
          }
        });
      }
      setRecommendations(recsMap);
    } catch (e: any) {
      setError(e?.message || "Failed to load course.");
      if (String(e?.message || "").includes("401")) {
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRecommendationChange = (
    learningStyle: string,
    mood: string,
    activityId: string
  ) => {
    const key = `${learningStyle}-${mood}`;
    setRecommendations((prev) => ({ ...prev, [key]: activityId }));
  };

  const handleSaveRecommendations = async () => {
    if (!id) return;

    const mappings: Mapping[] = [];
    Object.entries(recommendations).forEach(([key, activityId]) => {
      const [learning_style, mood] = key.split("-");
      if (activityId)
        mappings.push({ learning_style, mood, activity_id: activityId });
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

  const handleStartSession = () => {
    navigate(`/teacher/courses/${id}/session`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50">
        <div className="text-center">
          <div className="text-6xl mb-4">⏳</div>
          <p className="text-2xl font-bold text-gray-700">Loading course...</p>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen bg-red-50 flex items-center justify-center">
        <div className="max-w-lg bg-white rounded-xl p-6 shadow">
          <p className="text-red-600 font-semibold mb-4">
            {error || "Course not found"}
          </p>
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

  const active = getActiveSession();

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                {course.title}
              </h1>
              <p className="text-sm text-gray-600">
                Survey ID: {course.baseline_survey_id.slice(0, 8)}...
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => navigate("/teacher/dashboard")}
                className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200"
              >
                ← Dashboard
              </button>
              <button
                onClick={handleStartSession}
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold hover:from-green-600 hover:to-emerald-600"
              >
                Start Session
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
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
                onClick={() =>
                  navigate(`/teacher/sessions/${active.session_id}/results`)
                }
                className="px-3 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
              >
                View Results
              </button>
            </div>
          </div>
        )}

        {/* Course Info */}
        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            Course Information
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Learning Styles</p>
              <div className="flex flex-wrap gap-2 mt-1">
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
              <div className="flex flex-wrap gap-2 mt-1">
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
        </div>

        {/* Recommendations Matrix */}
        <div className="bg-white rounded-2xl shadow p-6">
          
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-gray-800">
                Activity Recommendations
              </h2>
              <p className="text-sm text-gray-600">
                Choose which activity to show for each learning style + mood
                combination
              </p>
            </div>
            <button
              onClick={handleSaveRecommendations}
              disabled={saving}
              className="px-4 py-2 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 disabled:opacity-50"
            >
              {saving ? "Saving..." : "💾 Save Recommendations"}
            </button>
          </div>

          {activities.length === 0 ? (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-800">
                No activities available. Please{" "}
                <button
                  onClick={() => navigate("/teacher/activities/create")}
                  className="text-blue-600 underline"
                >
                  create activities
                </button>{" "}
                first.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="border-2 border-gray-300 bg-gray-100 p-3 text-left font-semibold">
                      Learning Style / Mood
                    </th>
                    {course.mood_labels.map((mood) => (
                      <th
                        key={mood}
                        className="border-2 border-gray-300 bg-purple-50 p-3 text-center font-semibold capitalize"
                      >
                        {mood}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {course.learning_style_categories.map((style) => (
                    <tr key={style}>
                      <td className="border-2 border-gray-300 bg-blue-50 p-3 font-semibold capitalize">
                        {style === "visual" && "👁️ Visual"}
                        {style === "auditory" && "🎧 Auditory"}
                        {style === "kinesthetic" && "✋ Kinesthetic"}
                      </td>
                      {course.mood_labels.map((mood) => {
                        const key = `${style}-${mood}`;
                        const selectedActivityId = recommendations[key] || "";

                        return (
                          <td
                            key={mood}
                            className="border-2 border-gray-300 p-2"
                          >
                            <select
                              value={selectedActivityId}
                              onChange={(e) =>
                                handleRecommendationChange(
                                  style,
                                  mood,
                                  e.target.value
                                )
                              }
                              className="w-full px-2 py-2 rounded border-2 border-gray-200 focus:border-indigo-500 outline-none text-sm"
                            >
                              <option value="">-- No activity --</option>
                              {activities.map((activity) => (
                                <option key={activity.id} value={activity.id}>
                                  {activity.name} ({activity.type})
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
                <p className="font-semibold text-blue-900 mb-1">
                  How it works:
                </p>
                <p className="text-sm text-blue-800">
                  When a student completes the survey, we compute a learning
                  style and use the mood they selected to pick your configured
                  activity.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
