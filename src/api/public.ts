import { apiClient } from './client'
import type {
  PublicJoinResponse,
  PublicJoinSubmitRequest,
  PublicJoinSubmitResponse,
} from './types'

export function getJoinSession(joinToken: string) {
  return apiClient<PublicJoinResponse>(`/api/public/join/${joinToken}`, {
    skipAuth: true,
  })
}

export function submitJoinSession(joinToken: string, payload: PublicJoinSubmitRequest) {
  return apiClient<PublicJoinSubmitResponse>(`/api/public/join/${joinToken}/submit`, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function getJoinSubmissionStatus(joinToken: string, guestId?: string | null) {
  const params = guestId ? `?guest_id=${encodeURIComponent(guestId)}` : ''
  return apiClient<{ submitted: boolean }>(
    `/api/public/join/${joinToken}/submission${params}`,
  )
}
