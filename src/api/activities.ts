import { apiClient } from './client'
import type { Activity, ActivityType } from './types'

export interface CreateActivityTypePayload {
  type_name: string
  description: string
  required_fields: string[]
  optional_fields: string[]
  example_content_json?: Record<string, unknown>
}

export function listActivityTypes() {
  return apiClient<ActivityType[]>('/api/activity-types')
}

export function createActivityType(payload: CreateActivityTypePayload) {
  return apiClient<ActivityType>('/api/activity-types', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export interface CreateActivityPayload {
  name: string
  summary: string
  type: string
  tags: string[]
  content_json: Record<string, unknown>
}

export interface UpdateActivityPayload {
  name?: string
  summary?: string
  tags?: string[]
  content_json?: Record<string, unknown>
}

export function listActivities() {
  return apiClient<Activity[]>('/api/activities')
}

export function createActivity(payload: CreateActivityPayload) {
  return apiClient<Activity>('/api/activities', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function getActivity(activityId: string) {
  return apiClient<Activity>(`/api/activities/${activityId}`)
}

export function updateActivity(activityId: string, payload: UpdateActivityPayload) {
  return apiClient<Activity>(`/api/activities/${activityId}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
}
