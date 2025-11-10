// src/main.tsx - FINAL FIX FOR ROUTE MATCHING
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
  return token ? <>{children}</> : <Navigate to="/teacher/login" replace />;
}

function ModalSwitch() {
  const location = useLocation();
  const state = location.state as { backgroundLocation?: Location } | undefined;

  return (
    <>
      {/* Background routes */}
      <Routes location={state?.backgroundLocation || location}>
        {/* Public / student flow */}
        <Route path="/" element={<App />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/student/home" element={<StudentHome />} />
        <Route path="/join" element={<JoinSession />} />
        <Route path="/join/:joinToken" element={<JoinSession />} />

        {/* Teacher auth routes */}
        <Route path="/teacher/login" element={<Login />} />
        <Route path="/teacher/signup" element={<Signup />} />

        {/* Teacher dashboard */}
        <Route
          path="/teacher/dashboard"
          element={
            <RequireTeacher>
              <TeacherDashboard />
            </RequireTeacher>
          }
        />

        {/* 
          CRITICAL: Session route MUST come BEFORE the course modal route!
          More specific routes should be listed first.
        */}
        <Route
          path="/teacher/courses/:id/session"
          element={
            <RequireTeacher>
              <StartSessionPage />
            </RequireTeacher>
          }
        />

        {/* Results */}
        <Route
          path="/teacher/sessions/:sessionId/results"
          element={
            <RequireTeacher>
              <SessionResultsPage />
            </RequireTeacher>
          }
        />

        {/* Activities */}
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

      {/* 
        Modal routes - Only render when backgroundLocation exists
        IMPORTANT: The course detail route pattern /teacher/courses/:id 
        is LESS specific than /teacher/courses/:id/session, so React Router
        will match the session route first in the background routes above.
      */}
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