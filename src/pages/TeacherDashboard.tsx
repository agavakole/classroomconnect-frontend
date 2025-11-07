// src/pages/TeacherDashboard.tsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { teacherApi } from "../services/teacherApi";
import { Modal } from "../components/Modal";
import CreateSurveyModal from "../components/CreateSurveyModal";
import CreateActivityModal from "../components/CreateActivityModal";
import CreateCourseModal from "../components/CreateCourseModal";

export default function TeacherDashboard() {
  const navigate = useNavigate();

  const [surveys, setSurveys] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [showSurveyModal, setShowSurveyModal] = useState(false);
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [showCourseModal, setShowCourseModal] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [surveysData, activitiesData, coursesData] = await Promise.all([
        teacherApi.getSurveys(),
        teacherApi.getActivities(),
        teacherApi.getCourses(),
      ]);
      setSurveys(surveysData);
      setActivities(activitiesData);
      setCourses(coursesData);
    } catch (error) {
      console.error("Failed to load data:", error);
      if (error instanceof Error && error.message.includes("401")) {
        navigate("/teacher/login");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    teacherApi.logout();
    navigate("/teacher/login");
  };

  const handleSurveyCreated = () => {
    setShowSurveyModal(false);
    loadData(); // Refresh data
  };

  const handleActivityCreated = () => {
    setShowActivityModal(false);
    loadData();
  };

  const handleCourseCreated = () => {
    setShowCourseModal(false);
    loadData();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-2xl font-semibold text-gray-700">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      {/* Header */}
      <header className="bg-gradient-to-br from-blue-100 to-blue-200 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Teacher Dashboard
              </h1>
              <p className="text-gray-600">
                Manage your courses and activities
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2  text-black rounded-lg hover:bg-gray-300 transition"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* SURVEYS SECTION */}
          <section className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                Surveys
              </h2>
              <button
                onClick={() => setShowSurveyModal(true)}
                className="px-4 py-2 bg-gray-200 text-black rounded-lg hover:bg-gray-300 transition"
              >
                ➕ Create
              </button>
            </div>

            {surveys.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                No surveys yet. Create one to get started!
              </p>
            ) : (
              <div className="space-y-3">
                {surveys.map((survey) => (
                  <div
                    key={survey.id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition cursor-pointer"
                    onClick={() => navigate(`/teacher/surveys/${survey.id}`)}
                  >
                    <h3 className="font-semibold text-gray-800">
                      {survey.title}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {survey.total || survey.questions?.length || 0} questions
                    </p>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* ACTIVITIES SECTION */}
          <section className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                Activities
              </h2>
              <button
                onClick={() => setShowActivityModal(true)}
                className="px-4 py-2 bg-gray-200 text-black rounded-lg hover:bg-gray-300 transition"
              >
                ➕ Create
              </button>
            </div>

            {activities.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                No activities yet. Create one to get started!
              </p>
            ) : (
              <div className="space-y-3">
                {activities.map((activity) => (
                  <div
                    key={activity.id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition cursor-pointer"
                    onClick={() =>
                      navigate(`/teacher/activities/${activity.id}`)
                    }
                  >
                    <h3 className="font-semibold text-gray-800">
                      {activity.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
                        {activity.type}
                      </span>
                      <p className="text-sm text-gray-600 truncate">
                        {activity.summary}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* COURSES SECTION */}
          <section className="bg-white rounded-2xl shadow-lg p-6 lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                Courses
              </h2>
              <button
                onClick={() => setShowCourseModal(true)}
                className="px-4 py-2 bg-gray-200 text-black rounded-lg hover:bg-gray-300 transition"
              >
                ➕ Create Course
              </button>
            </div>

            {courses.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                No courses yet. Create one to get started!
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {courses.map((course) => (
                  <div
                    key={course.id}
                    className="border-2 border-gray-200 rounded-xl p-5 hover:shadow-lg hover:border-indigo-300 transition cursor-pointer"
                    onClick={() => navigate(`/teacher/courses/${course.id}`)}
                  >
                    <h3 className="font-bold text-lg text-gray-800 mb-2">
                      {course.title}
                    </h3>
                    <div className="flex flex-wrap gap-1 mb-3">
                      {course.mood_labels?.map((mood: string) => (
                        <span
                          key={mood}
                          className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded"
                        >
                          {mood}
                        </span>
                      ))}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/teacher/courses/${course.id}/session`);
                      }}
                      className="w-full px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:from-green-600 hover:to-emerald-600 transition font-medium"
                    >
                      🚀 Start Session
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>

      {/* Modals */}
      {showSurveyModal && (
        <CreateSurveyModal
          onClose={() => setShowSurveyModal(false)}
          onSuccess={handleSurveyCreated}
        />
      )}

      {showActivityModal && (
        <CreateActivityModal
          onClose={() => setShowActivityModal(false)}
          onSuccess={handleActivityCreated}
        />
      )}

      {showCourseModal && (
        <CreateCourseModal
          surveys={surveys}
          onClose={() => setShowCourseModal(false)}
          onSuccess={handleCourseCreated}
        />
      )}
    </div>
  );
}
