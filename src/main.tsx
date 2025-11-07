// src/main.tsx
import React from "react";

import ReactDOM from "react-dom/client";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate,
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
import StudentHome from "./pages/StudentHome"; // NEW
import "./index.css";         
function DevBootToHome() {
  const nav = useNavigate();
  const loc = useLocation();

  React.useEffect(() => {
    if (import.meta.env.DEV && loc.pathname !== "/") {
      nav("/", { replace: true });
    }
  }, [loc.pathname, nav]);

  return null;
}

function RequireTeacher({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem("teacher_token");
  return token ? <>{children}</> : <Navigate to="/login" replace />;
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        {/* Public student flow container (Home → Join → Welcome → Survey) */}
        <Route path="/" element={<App />} />

        {/* Auth (single entry for both roles) */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Student area */}
        <Route path="/student/home" element={<StudentHome />} />

        {/* Public join */}
        <Route path="/join" element={<JoinSession />} />
        <Route path="/join/:joinToken" element={<JoinSession />} />

        {/* Teacher area (protected) */}
        <Route
          path="/teacher/dashboard"
          element={
            <RequireTeacher>
              <TeacherDashboard />
            </RequireTeacher>
          }
        />
        <Route
          path="/teacher/surveys/:id"
          element={
            <RequireTeacher>
              <TeacherSurveyDetail />
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
<Route
  path="/teacher/activities/:id"
  element={
    <RequireTeacher>
      <TeacherActivityDetail />
    </RequireTeacher>
  }
/>
          <Route path="/join" element={<JoinSession />} />
  <Route path="/join/:joinToken" element={<JoinSession />} />


        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
