// src/types/index.ts

// ============================================
// Component Props Types
// ============================================

export interface ButtonProps {
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
}

export interface ProgressBarProps {
  current: number;
  total: number;
}

export interface QuestionCardProps {
  emoji?: string;
  text: string;
}

export interface AnswerButtonProps {
  value: number;
  text: string;
  emoji?: string;
  color?: string;
  textColor?: string;
  onClick: (value: number) => void;
  isSelected?: boolean;
  ringColor?: string;
}

// ============================================
// Data Types
// ============================================

// LOCAL question format (your hardcoded questions)
export interface Question {
  id: number;
  text: string;
  emoji?: string;
  options?: AnswerOption[]; 
}

// BACKEND question format (from API)
export interface BackendQuestion {
  question_id: string;
  text: string;
  options: Array<{
    option_id: string;
    text: string;
  }>;
}

export interface AnswerOption {
  value?: number;
  text: string;
  emoji?: string;
  color?: string;
  textColor?: string;
  ringColor?: string;
}

// ============================================
// API Types (for backend connection)
// ============================================

export interface SessionData {
  joinToken: string;
  session: {
    session_id: string;
    require_survey: boolean;
    mood_check_schema?: {
      prompt: string;
      options: string[];
    };
    survey?: {
      survey_id: string;
      title: string;
      questions: BackendQuestion[];  // ← Use BackendQuestion type
    };
    status: string;
  };
}