import { apiClient } from './client'
import type { PersonProfile, StudentSubmissionsResponse } from './types'

export function getStudentProfile() {
  return apiClient<PersonProfile>('/api/students/me')
}

export function getStudentSubmissions() {
  return apiClient<StudentSubmissionsResponse>('/api/students/submissions')
}
