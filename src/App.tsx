// src/App.tsx
import { Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from './components/layout/AppLayout'
import { TeacherLayout } from './components/layout/TeacherLayout'
import { RequireAuth } from './components/routing/RequireAuth'
import { LandingPage } from './pages/LandingPage'
import { TeacherLoginPage } from './pages/auth/TeacherLoginPage'
import { TeacherSignupPage } from './pages/auth/TeacherSignupPage'
import { StudentLoginPage } from './pages/auth/StudentLoginPage'
import { StudentSignupPage } from './pages/auth/StudentSignupPage'
import { GuestJoinPage } from './pages/public/GuestJoinPage'
import { ScanPage } from './pages/public/ScanPage'
import { SessionRunPage } from './pages/public/SessionRunPage'
import { SessionResultPage } from './pages/public/SessionResultPage'
import { SessionSharePage } from './pages/public/SessionSharePage'
import { StudentDashboardPage } from './pages/student/StudentDashboardPage'
import { TeacherCourseLibraryPage } from './pages/teacher/TeacherCourseLibraryPage'
import { TeacherCourseCreatePage } from './pages/teacher/TeacherCourseCreatePage'
import { TeacherCourseDetailPage } from './pages/teacher/TeacherCourseDetailPage'
import { TeacherSurveyCreatePage } from './pages/teacher/TeacherSurveyCreatePage'
import { TeacherSurveysPage } from './pages/teacher/TeacherSurveysPage'
import { TeacherSurveyDetailPage } from './pages/teacher/TeacherSurveyDetailPage'
import { TeacherActivityCreatePage } from './pages/teacher/TeacherActivityCreatePage'
import { TeacherActivitiesPage } from './pages/teacher/TeacherActivitiesPage'
import { TeacherActivityDetailPage } from './pages/teacher/TeacherActivityDetailPage'
import { TeacherActivityTypeCreatePage } from './pages/teacher/TeacherActivityTypeCreatePage'
import { TeacherActivityTypesPage } from './pages/teacher/TeacherActivityTypesPage'
import { TeacherActivityTypeDetailPage } from './pages/teacher/TeacherActivityTypeDetailPage'
import { TeacherSessionCreatePage } from './pages/teacher/TeacherSessionCreatePage'
import { TeacherSessionsPage } from './pages/teacher/TeacherSessionsPage'
import { TeacherSessionDashboardPage } from './pages/teacher/TeacherSessionDashboardPage'
import { NotFoundPage } from './pages/NotFoundPage'

function App() {
  return (
    <Routes>
      {/* Teacher Routes - Use TeacherLayout ONLY (no AppLayout) */}
      <Route
        path="/teacher"
        element={
          <RequireAuth roles={['teacher']}>
            <TeacherLayout />
          </RequireAuth>
        }
      >
        <Route index element={<Navigate to="courses" replace />} />
        <Route path="courses" element={<TeacherCourseLibraryPage />} />
        <Route path="courses/new" element={<TeacherCourseCreatePage />} />
        <Route path="courses/:courseId" element={<TeacherCourseDetailPage />} />
        <Route path="surveys" element={<TeacherSurveysPage />} />
        <Route path="surveys/new" element={<TeacherSurveyCreatePage />} />
        <Route path="surveys/:surveyId" element={<TeacherSurveyDetailPage />} />
        <Route path="activities" element={<TeacherActivitiesPage />} />
        <Route path="activities/new" element={<TeacherActivityCreatePage />} />
        <Route path="activities/:activityId" element={<TeacherActivityDetailPage />} />
        <Route path="activity-types" element={<TeacherActivityTypesPage />} />
        <Route path="activity-types/new" element={<TeacherActivityTypeCreatePage />} />
        <Route path="activity-types/:typeName" element={<TeacherActivityTypeDetailPage />} />
        <Route path="sessions" element={<TeacherSessionsPage />} />
        <Route path="sessions/new" element={<TeacherSessionCreatePage />} />
        <Route path="sessions/:sessionId" element={<TeacherSessionDashboardPage />} />
        <Route
          path="sessions/:sessionId/dashboard"
          element={<TeacherSessionDashboardPage />}
        />
      </Route>
      <Route index element={<LandingPage />} />
      <Route path="login">
          <Route path="teacher" element={<TeacherLoginPage />} />
          <Route path="student" element={<StudentLoginPage />} />
      </Route>
            <Route path="signup">
          <Route path="teacher" element={<TeacherSignupPage />} />
          <Route path="student" element={<StudentSignupPage />} />
        </Route>
        <Route path="guest/join" element={<GuestJoinPage />} />
      {/* All other routes - Use AppLayout (top navigation) */}
      <Route path="/" element={<AppLayout />}>
        
        
  
        
        <Route path="scan" element={<ScanPage />} />
        <Route path="join" element={<SessionSharePage />} />
        <Route path="session/run/:token" element={<SessionRunPage />} />
        <Route path="session/run/:token/result" element={<SessionResultPage />} />
        <Route
          path="student"
          element={
            <RequireAuth roles={['student']}>
              <StudentDashboardPage />
            </RequireAuth>
          }
        />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}

export default App
