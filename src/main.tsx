// src/main.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";

import App from "./App";
import JoinSession from "./pages/JoinSessionPage";
import TeacherDashboard from "./pages/TeacherDashboard";
import TeacherSurveyDetail from "./pages/TeacherSurveyDetail";
import TeacherCourseDetail from "./pages/TeacherCourseDetail";
import StartSessionPage from "./pages/StartSessionPage";
import SessionResultsPage from "./pages/SessionResultsPage";
import TeacherActivitiesPage from "./pages/TeacherActivityPage";
import TeacherActivityDetail from "./pages/TeacherActivityDetail";
import { Login } from "./pages/Login";
import { Signup } from "./pages/Signup";
import StudentHome from "./pages/StudentHome";
import "./index.css";

function RequireTeacher({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem("teacher_token");
  return token ? <>{children}</> : <Navigate to="/login" replace />;
}

/**
 * Modal routes pattern:
 * - Render the "background" UI using backgroundLocation (the page you came from).
 * - If backgroundLocation exists, also render the modal routes on top.
 */
function ModalSwitch() {
  const location = useLocation();
  const state = location.state as { backgroundLocation?: Location } | undefined;

  return (
    <>
      {/* Background: render the previous route, or the current route if none */}
      <Routes location={state?.backgroundLocation || location}>
        {/* Public / student flow */}
        <Route path="/" element={<App />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/student/home" element={<StudentHome />} />
        <Route path="/join" element={<JoinSession />} />
        <Route path="/join/:joinToken" element={<JoinSession />} />

        {/* Teacher pages (non-modal “pages”) */}
        <Route
          path="/teacher/dashboard"
          element={
            <RequireTeacher>
              <TeacherDashboard />
            </RequireTeacher>
          }
        />
        <Route
          path="/teacher/courses/:id/session"
          element={
            <RequireTeacher>
              <StartSessionPage />
            </RequireTeacher>
          }
        />
        <Route
          path="/teacher/sessions/:sessionId/results"
          element={
            <RequireTeacher>
              <SessionResultsPage />
            </RequireTeacher>
          }
        />
        <Route
          path="/teacher/activities"
          element={
            <RequireTeacher>
              <TeacherActivitiesPage />
            </RequireTeacher>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* Foreground: only render these when we have a background page to sit on top of */}
      {state?.backgroundLocation && (
        <Routes>
          <Route
            path="/teacher/surveys/:id"
            element={
              <RequireTeacher>
                <TeacherSurveyDetail />
              </RequireTeacher>
            }
          />
          <Route
            path="/teacher/activities/:id"
            element={
              <RequireTeacher>
                <TeacherActivityDetail />
              </RequireTeacher>
            }
          />
          <Route
            path="/teacher/courses/:id"
            element={
              <RequireTeacher>
                <TeacherCourseDetail />
              </RequireTeacher>
            }
          />
        </Routes>
      )}
    </>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <ModalSwitch />
    </BrowserRouter>
  </React.StrictMode>
);
