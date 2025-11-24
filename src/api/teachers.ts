import { apiClient } from './client'
import type { PersonProfile } from './types'

export function getTeacherProfile() {
  return apiClient<PersonProfile>('/api/teachers/me')
}