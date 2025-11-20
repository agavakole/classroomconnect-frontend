import { apiClient } from './client'
import type {
  Course,
  CourseRecommendationAutoResponse,
  CourseRecommendationUpdatePayload,
  CourseRecommendationsResponse,
} from './types'

export interface CreateCoursePayload {
  title: string
  baseline_survey_id: string
  mood_labels: string[]
}

export interface UpdateCoursePayload {
  title?: string
  baseline_survey_id?: string
}

export function listCourses() {
  return apiClient<Course[]>('/api/courses')
}

export function getCourse(courseId: string) {
  return apiClient<Course>(`/api/courses/${courseId}`)
}

export function createCourse(payload: CreateCoursePayload) {
  return apiClient<Course>('/api/courses', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}



export function deleteCourse(courseId: string) {
  return apiClient<void>(`/api/courses/${courseId}`, {
    method: 'DELETE',
  })
}

export function updateCourse(courseId: string, payload: UpdateCoursePayload) {
  return apiClient<Course>(`/api/courses/${courseId}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
}

export function getCourseRecommendations(courseId: string) {
  return apiClient<CourseRecommendationsResponse>(
    `/api/courses/${courseId}/recommendations`,
  )
}

export function updateCourseRecommendations(
  courseId: string,
  payload: CourseRecommendationUpdatePayload,
) {
  return apiClient<CourseRecommendationsResponse>(
    `/api/courses/${courseId}/recommendations`,
    {
      method: 'PATCH',
      body: JSON.stringify(payload),
    },
  )
}

export interface AutoGenerateRecommendationsPayload {
  model?: string
  temperature?: number
  activity_limit?: number
}

export function autoGenerateCourseRecommendations(
  courseId: string,
  payload: AutoGenerateRecommendationsPayload = {},
) {
  return apiClient<CourseRecommendationAutoResponse>(
    `/api/courses/${courseId}/recommendations/auto`,
    {
      method: 'POST',
      body: JSON.stringify(payload),
    },
  )
}

export interface CreateSessionPayload {
  require_survey: boolean
  mood_prompt: string
}

export interface CreateSessionResponse {
  session_id: string
  course_id: string
  require_survey: boolean
  join_token: string
  qr_url: string
  started_at?: string
}

export function createCourseSession(courseId: string, payload: CreateSessionPayload) {
  return apiClient<CreateSessionResponse>(`/api/sessions/${courseId}/sessions`, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}
