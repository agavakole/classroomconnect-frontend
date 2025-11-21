import { apiClient } from './client'
import type { SurveyTemplate } from './types'

export interface CreateSurveyOptionPayload {
  label: string
  scores: Record<string, number>
}

export interface CreateSurveyQuestionPayload {
  id: string
  text: string
  options: CreateSurveyOptionPayload[]
}

export interface CreateSurveyPayload {
  title: string
  questions: CreateSurveyQuestionPayload[]
}

export function listSurveys() {
  return apiClient<SurveyTemplate[]>('/api/surveys')
}

export function createSurvey(payload: CreateSurveyPayload) {
  return apiClient<SurveyTemplate>('/api/surveys', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function getSurvey(surveyId: string) {
  return apiClient<SurveyTemplate>(`/api/surveys/${surveyId}`)
}
