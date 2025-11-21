import { apiClient } from './client'
import type { AuthTokenResponse, PersonProfile } from './types'

interface AuthCredentials {
  email: string
  password: string
}

interface SignupPayload extends AuthCredentials {
  full_name: string
}

export async function teacherLogin(payload: AuthCredentials) {
  return apiClient<AuthTokenResponse>('/api/teachers/login', {
    method: 'POST',
    body: JSON.stringify(payload),
    skipAuth: true,
  })
}

export async function teacherSignup(payload: SignupPayload) {
  return apiClient<PersonProfile>('/api/teachers/signup', {
    method: 'POST',
    body: JSON.stringify(payload),
    skipAuth: true,
  })
}

export async function studentLogin(payload: AuthCredentials) {
  return apiClient<AuthTokenResponse>('/api/students/login', {
    method: 'POST',
    body: JSON.stringify(payload),
    skipAuth: true,
  })
}

export async function studentSignup(payload: SignupPayload) {
  return apiClient<PersonProfile>('/api/students/signup', {
    method: 'POST',
    body: JSON.stringify(payload),
    skipAuth: true,
  })
}
