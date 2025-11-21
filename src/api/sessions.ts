import { apiClient } from './client'
import type {
  CourseSessionSummary,
  SessionDashboardResponse,
  SessionSubmissionsResponse,
} from './types'

export function getSessionDashboard(sessionId: string) {
  return apiClient<SessionDashboardResponse>(
    `/api/sessions/${sessionId}/dashboard`,
  )
}

export function listCourseSessions(courseId: string) {
  return apiClient<CourseSessionSummary[]>(
    `/api/sessions/${courseId}/sessions`,
  )
}

export function getSessionSubmissions(sessionId: string) {
  return apiClient<SessionSubmissionsResponse>(
    `/api/sessions/${sessionId}/submissions`,
  )
}

export function closeSession(sessionId: string) {
  return apiClient<{ status: string }>(`/api/sessions/${sessionId}/close`, {
    method: 'POST',
  })
}
