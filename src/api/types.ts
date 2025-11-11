export interface AuthTokenResponse {
  access_token: string
  token_type: string
}

export interface PersonProfile {
  id: string
  email: string
  full_name: string
  created_at?: string
}

export interface StudentSubmission {
  id: string
  session_id: string
  course_title: string
  answers: Record<string, string>
  status: string
  created_at: string
  updated_at?: string | null
}

export interface StudentSubmissionsResponse {
  submissions: StudentSubmission[]
  total: number
}

export interface PublicJoinSurveyOption {
  option_id: string
  text: string
}

export interface PublicJoinSurveyQuestion {
  question_id: string
  text: string
  options: PublicJoinSurveyOption[]
}

export interface PublicJoinSurvey {
  survey_id: string
  title: string
  questions: PublicJoinSurveyQuestion[]
}

export interface PublicJoinResponse {
  session_id: string
  course_id: string
  course_title: string
  require_survey: boolean
  mood_check_schema: {
    prompt: string
    options: string[]
  }
  survey?: PublicJoinSurvey | null
  status: 'OPEN' | 'CLOSED'
}

export interface PublicJoinSubmitRequest {
  mood: string
  answers?: Record<string, string>
  is_guest?: boolean
  student_name?: string
  guest_id?: string | null
}

export interface RecommendedActivity {
  match_type: string
  learning_style?: string
  mood?: string
  activity: {
    activity_id: string
    name: string
    summary: string
    type: string
    content_json: Record<string, unknown>
  }
}

export interface PublicJoinSubmitResponse {
  submission_id: string
  student_id: string | null
  guest_id: string | null
  require_survey: boolean
  is_baseline_update: boolean
  mood: string
  learning_style: string | null
  total_scores: Record<string, number>
  recommended_activity: RecommendedActivity
  message?: string
}

export interface Course {
  id: string
  title: string
  baseline_survey_id: string
  learning_style_categories: string[]
  mood_labels: string[]
  requires_rebaseline: boolean
  created_at: string
  updated_at: string
}

export interface CourseRecommendationMapping {
  learning_style: string | null
  mood: string
  activity?: {
    activity_id: string
    name: string
    summary: string
    type: string
    content_json: Record<string, unknown>
  }
}

export interface CourseRecommendationsResponse {
  course_id: string
  learning_style_categories: string[]
  mood_labels: string[]
  mappings: CourseRecommendationMapping[]
}

export interface CourseRecommendationUpdatePayload {
  mappings: Array<{
    learning_style: string | null
    mood: string
    activity_id: string
  }>
}

export type CourseRecommendationAutoResponse = CourseRecommendationUpdatePayload

export interface SurveyTemplate {
  id: string
  title: string
  questions: Array<{
    id: string
    text: string
    options: Array<{
      label: string
      scores: Record<string, number>
    }>
  }>
  creator_name?: string
  creator_id?: string
  creator_email?: string
  created_at?: string
  total?: number
}

export interface ActivityType {
  type_name: string
  description: string
  required_fields: string[]
  optional_fields: string[]
  example_content_json?: Record<string, unknown>
}

export interface Activity {
  id: string
  name: string
  summary: string
  type: string
  tags: string[]
  content_json: Record<string, unknown>
  creator_id: string
  creator_name: string
  creator_email: string
  created_at: string
  updated_at: string
}

export interface SessionDashboardParticipant {
  display_name: string
  mode: string
  student_id: string | null
  guest_id: string | null
  mood: string
  learning_style: string | null
  recommended_activity?: RecommendedActivity
}

export interface SessionDashboardResponse {
  session_id: string
  course_id: string
  course_title: string
  require_survey: boolean
  mood_summary: Record<string, number>
  participants: SessionDashboardParticipant[]
  started_at?: string
  closed_at?: string | null
}

export interface CourseSessionSummary {
  session_id: string
  course_id: string
  require_survey: boolean
  mood_check_schema: {
    prompt: string
    options: string[]
  }
  survey_snapshot_json?: Record<string, unknown> | null
  started_at: string
  closed_at: string | null
  join_token: string
  qr_url: string
}

export interface SessionSubmission {
  student_name: string | null
  student_id: string | null
  student_full_name?: string | null
  guest_id?: string | null
  mood: string
  answers: Record<string, string>
  total_scores: Record<string, number>
  learning_style: string | null
  is_baseline_update: boolean
  status: string
  created_at: string
  updated_at?: string | null
}

export interface SessionSubmissionsResponse {
  session_id: string
  count: number
  items: SessionSubmission[]
}
