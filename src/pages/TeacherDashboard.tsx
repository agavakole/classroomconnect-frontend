// src/pages/TeacherDashboard.tsx
import { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { teacherApi } from "../services/api";
import CreateSurveyModal from "../components/CreateSurveyModal";
import CreateActivityModal from "../components/CreateActivityModal";
import CreateCourseModal from "../components/CreateCourseModal";

/**
 * Main teacher dashboard - central hub for managing educational content
 * 
 * Features:
 * - View/create surveys (learning style assessments)
 * - View/create activities (videos, worksheets, exercises)
 * - View/create courses (containers linking surveys + activities)
 * - Start sessions via "Start Session" button on course cards
 * 
 * Backend connections:
 * - GET /api/surveys/ - Load all teacher's surveys
 * - GET /api/activities/ - Load all teacher's activities
 * - GET /api/courses/ - Load all teacher's courses
 */
export default function TeacherDashboard() {
  const navigate = useNavigate();
  const location = useLocation(); // Used for modal backgroundLocation state

  // Data arrays fetched from backend
  const [surveys, setSurveys] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal visibility state
  const [showSurveyModal, setShowSurveyModal] = useState(false);
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [showCourseModal, setShowCourseModal] = useState(false);

  /**
   * On mount: fetch all teacher data from backend
   * Runs once when component loads
   */
  useEffect(() => {
    loadData();
  }, []);

  /**
   * Fetches surveys, activities, courses in parallel
   * Backend: Multiple GET requests with teacher JWT token
   * 
   * If 401 error (unauthorized) → redirect to login
   * Teacher's token may have expired
   */
  const loadData = async () => {
    try {
      setLoading(true);
      const [surveysData, activitiesData, coursesData] = await Promise.all([
        teacherApi.getSurveys(),      // GET /api/surveys/
        teacherApi.getActivities(),   // GET /api/activities/
        teacherApi.getCourses(),      // GET /api/courses/
      ]);
      setSurveys(surveysData);
      setActivities(activitiesData);
      setCourses(coursesData);
    } catch (err: any) {
      console.error("Failed to load data:", err);
      // Redirect to login if authentication fails
      if (err instanceof Error && err.message.includes("401")) {
        navigate("/teacher/login");
      }
    } finally {
      setLoading(false);
    }
  };

  /**
   * Logs out teacher by removing JWT token
   * Frontend-only operation, no backend call needed
   */
  const handleLogout = () => {
    teacherApi.logout(); // Removes token from localStorage
    navigate("/teacher/login");
  };

  /**
   * Modal success handlers - called after successful creation
   * Close modal and reload data to show new item
   */
  const handleSurveyCreated = () => {
    setShowSurveyModal(false);
    loadData(); // Refresh to show newly created survey
  };
  const handleActivityCreated = () => {
    setShowActivityModal(false);
    loadData();
  };
  const handleCourseCreated = () => {
    setShowCourseModal(false);
    loadData();
  };

  // Shared CSS classes for consistent styling
  const panel = "bg-white/95 ring-1 ring-gray-200 shadow-sm";
  const primaryBtn =
    "px-4 py-2 rounded-xl bg-gradient-to-r from-[#00C6FF] to-[#0072FF] text-white font-semibold shadow-[0_10px_20px_rgba(38,132,255,0.35)] hover:shadow-[0_14px_28px_rgba(38,132,255,0.45)] transition";
  const subtleBtn =
    "px-4 py-2 rounded-xl bg-white border-2 border-gray-200 hover:border-[#0072FF] font-semibold transition";

  // Loading screen while fetching data
  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center
        bg-no-repeat bg-cover
        bg-[position:center_160%]"
        style={{
          backgroundImage: `
            linear-gradient(to bottom right, rgba(255,255,255,0.60), rgba(255,255,255,0.60)),
            url('/images/3d-image.png')
          `,
        }}
      >
        <div className="animate-pulse text-gray-700 text-lg">Loading…</div>
      </div>
    );
  }

  return (
    <div
      className="
        min-h-screen
        bg-no-repeat bg-cover
        bg-[position:center_200%] lg:bg-[position:center_240%]
      "
      style={{
        backgroundImage: `
          linear-gradient(to bottom right, rgba(255,255,255,0.30), rgba(255,255,255,0.40)),
          url('/images/3d-image.png')
        `,
      }}
    >
      {/* HEADER - sticky navigation bar */}
      <header className="sticky top-0 z-30 border-b border-white/60 bg-white/70 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          {/* Logo - clickable to go home */}
          <button
            onClick={() => navigate("/")}
            className="text-2xl font-extrabold text-gray-900"
          >
            Class<span className="text-[#0AC5FF]">Connect</span>
          </button>
          
          {/* Right side buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate("/teacher/profile")}
              className={subtleBtn}
            >
              Profile
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2 rounded-xl hover:bg-gray-200"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* PAGE HEADING - title and create buttons */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-6 pt-8">
        <div className={`rounded-3xl p-6 sm:p-8 ${panel}`}>
          <div className="flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
                Teacher Dashboard
              </h1>
              <p className="text-gray-700">
                Manage surveys, activities, and courses.
              </p>
            </div>
            {/* Quick create buttons */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setShowSurveyModal(true)}
                className={primaryBtn}
              >
                ➕ New Survey
              </button>
              <button
                onClick={() => setShowActivityModal(true)}
                className={subtleBtn}
              >
                ➕ New Activity
              </button>
              <button
                onClick={() => setShowCourseModal(true)}
                className={subtleBtn}
              >
                ➕ New Course
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT - grid layout with surveys, activities, courses */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* SURVEYS SECTION */}
          <section className={`rounded-3xl p-6 sm:p-8 ${panel}`}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-bold text-gray-900">Surveys</h2>
              <button
                onClick={() => setShowSurveyModal(true)}
                className={subtleBtn}
              >
                Create
              </button>
            </div>

            {surveys.length === 0 ? (
              <Empty message="No surveys yet. Create one to get started!" />
            ) : (
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {surveys.map((s) => (
                  <li
                    key={s.id}
                    className="rounded-2xl ring-1 ring-gray-200 bg-white p-4 hover:shadow-md transition cursor-pointer"
                    // Opens survey detail modal
                    // backgroundLocation preserves dashboard in background
                    onClick={() =>
                      navigate(`/teacher/surveys/${s.id}`, {
                        state: { backgroundLocation: location },
                      })
                    }
                  >
                    <div className="flex items-start justify-between">
                      <h3 className="font-semibold text-gray-900">{s.title}</h3>
                      <span className="text-xs text-gray-600">
                        {s.total || s.questions?.length || 0} questions
                      </span>
                    </div>
                    {s.description && (
                      <p className="text-sm text-gray-700 mt-1 line-clamp-2">
                        {s.description}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* ACTIVITIES SECTION */}
          <section className={`rounded-3xl p-6 sm:p-8 ${panel}`}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-bold text-gray-900">Activities</h2>
              <button
                onClick={() => setShowActivityModal(true)}
                className={subtleBtn}
              >
                Create
              </button>
            </div>

            {activities.length === 0 ? (
              <Empty message="No activities yet. Create one to get started!" />
            ) : (
              <ul className="space-y-3">
                {activities.map((a) => (
                  <li key={a.id}>
                    {/* Link opens activity detail modal */}
                    <Link
                      to={`/teacher/activities/${a.id}`}
                      state={{ backgroundLocation: location }}
                      className="block rounded-2xl ring-1 ring-gray-200 bg-white p-4 hover:shadow-md transition"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {a.name}
                          </h3>
                          <p className="text-sm text-gray-700 line-clamp-2">
                            {a.summary}
                          </p>
                        </div>
                        <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
                          {a.type}
                        </span>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* COURSES SECTION - spans full width on large screens */}
          <section className={`rounded-3xl p-6 sm:p-8 lg:col-span-2 ${panel}`}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-bold text-gray-900">Courses</h2>
              <button
                onClick={() => setShowCourseModal(true)}
                className={subtleBtn}
              >
                Create
              </button>
            </div>

            {courses.length === 0 ? (
              <Empty message="No courses yet. Create one to get started!" />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {courses.map((c) => (
                  <div
                    key={c.id}
                    className="rounded-2xl ring-1 ring-gray-200 bg-white p-5 hover:shadow-lg transition"
                    // Card click opens course detail modal
                    onClick={() =>
                      navigate(`/teacher/courses/${c.id}`, {
                        state: { backgroundLocation: location },
                      })
                    }
                  >
                    <h3 className="font-semibold text-gray-900">{c.title}</h3>

                    {/* Display mood labels as badges */}
                    {c.mood_labels?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {c.mood_labels.map((m: string) => (
                          <span
                            key={m}
                            className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded"
                          >
                            {m}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* 
                      START SESSION BUTTON
                      IMPORTANT: Does NOT pass backgroundLocation
                      This navigates to full-page session view, not a modal
                      
                      Passes:
                      - fromDashboard: true (so back button knows where we came from)
                      - courseId: for the back button to reopen course modal
                    */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent card click from firing
                        navigate(`/teacher/courses/${c.id}/session`, {
                          state: {
                            fromDashboard: true,
                            courseId: c.id,
                          },
                        });
                      }}
                      className="w-full mt-4 px-4 py-2 rounded-xl bg-gradient-to-r from-[#00C6FF] to-[#0072FF] text-white font-semibold shadow-[0_10px_20px_rgba(38,132,255,0.35)] hover:shadow-[0_14px_28px_rgba(38,132,255,0.45)] transition"
                    >
                      Start Session
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>

      {/* MODALS - rendered conditionally based on state */}
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
          surveys={surveys} // Pass surveys for dropdown
          onClose={() => setShowCourseModal(false)}
          onSuccess={handleCourseCreated}
        />
      )}
    </div>
  );
}

/**
 * Empty state component - shown when no items exist
 * Reusable across surveys, activities, courses sections
 */
function Empty({ message }: { message: string }) {
  return (
    <div className="rounded-2xl ring-1 ring-gray-200 bg-white p-8 text-center text-gray-600">
      {message}
    </div>
  );
}