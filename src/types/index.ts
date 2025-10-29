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
  emoji: string;
  text: string;
}

export interface AnswerButtonProps {
  value: number;
  text: string;
  emoji: string;
  color: string;
  textColor: string;
  onClick: (value: number) => void;
  isSelected?: boolean;
  ringColor?: string;
}

// ============================================
// Data Types
// ============================================

// Define what a question looks like
export interface Question {
  id: number;
  text: string;
  emoji: string;
  options?: AnswerOption[]; 
}

export interface AnswerOption {
  value: number;
  text: string;
  emoji: string;
  color: string;
  textColor: string;
  ringColor: string;
}
















// ============================================
// API Types (for backend connection)
// ============================================



