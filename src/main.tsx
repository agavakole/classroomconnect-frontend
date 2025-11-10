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

/**
 * Protected route wrapper for teacher-only pages
 * Checks localStorage for teacher_token
 * Redirects to login if not authenticated
 */
function RequireTeacher({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem("teacher_token");
  return token ? <>{children}</> : <Navigate to="/teacher/login" replace />;
}

/**
 * Modal routing component
 * Implements "modal over background" pattern
 * 
 * How it works:
 * 1. Background routes render full pages
 * 2. Modal routes render when state.backgroundLocation exists
 * 3. Modals display on top of background location
 * 
 * Example flow:
 * - User at /teacher/dashboard
 * - Clicks course card → navigate to /teacher/courses/:id with backgroundLocation
 * - Background: still shows dashboard
 * - Foreground: modal with course details
 * - Close modal → returns to dashboard (background)
 */
function ModalSwitch() {
  const location = useLocation();
  const state = location.state as { backgroundLocation?: Location } | undefined;

  return (
    <>
      {/* 
        BACKGROUND ROUTES
        These render full-page components
        Used as "base" when modals are open
      */}
      <Routes location={state?.backgroundLocation || location}>
        {/* PUBLIC / STUDENT ROUTES */}
        <Route path="/" element={<App />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/student/home" element={<StudentHome />} />
        <Route path="/join" element={<JoinSession />} />
        <Route path="/join/:joinToken" element={<JoinSession />} />

        {/* TEACHER AUTH ROUTES */}
        <Route path="/teacher/login" element={<Login />} />
        <Route path="/teacher/signup" element={<Signup />} />

        {/* TEACHER DASHBOARD */}
        <Route
          path="/teacher/dashboard"
          element={
            <RequireTeacher>
              <TeacherDashboard />
            </RequireTeacher>
          }
        />

        {/* 
          CRITICAL: Session route MUST come BEFORE course modal route
          More specific routes should be listed first in React Router
          
          This is a FULL-PAGE route, not a modal
          /teacher/courses/:id/session → StartSessionPage (full screen)
        */}
        <Route
          path="/teacher/courses/:id/session"
          element={
            <RequireTeacher>
              <StartSessionPage />
            </RequireTeacher>
          }
        />

        {/* SESSION RESULTS - full page */}
        <Route
          path="/teacher/sessions/:sessionId/results"
          element={
            <RequireTeacher>
              <SessionResultsPage />
            </RequireTeacher>
          }
        />

        {/* ACTIVITIES BROWSER - full page */}
        <Route
          path="/teacher/activities"
          element={
            <RequireTeacher>
              <TeacherActivitiesPage />
            </RequireTeacher>
          }
        />

        {/* FALLBACK - redirect unknown routes to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* 
        MODAL ROUTES
        Only render when backgroundLocation exists in state
        
        These components render as modals over the background
        Example: /teacher/courses/:id opens as modal over dashboard
        
        IMPORTANT: The course detail route /teacher/courses/:id
        is LESS specific than /teacher/courses/:id/session,
        so React Router matches the session route first in background routes
      */}
      {state?.backgroundLocation && (
        <Routes>
          {/* SURVEY DETAIL MODAL */}
          <Route
            path="/teacher/surveys/:id"
            element={
              <RequireTeacher>
                <TeacherSurveyDetail />
              </RequireTeacher>
            }
          />
          
          {/* ACTIVITY DETAIL MODAL */}
          <Route
            path="/teacher/activities/:id"
            element={
              <RequireTeacher>
                <TeacherActivityDetail />
              </RequireTeacher>
            }
          />
          
          {/* COURSE DETAIL MODAL */}
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

/**
 * Application entry point
 * Mounts React app to DOM
 * Wraps in BrowserRouter for client-side routing
 */
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <ModalSwitch />
    </BrowserRouter>
  </React.StrictMode>
);