export type QuestionType =
  | "text"
  | "number"
  | "date"
  | "single"
  | "multi"
  | "dropdown"
  | "yesno";

export type QuestionOption = {
  label: string;
  value: string;
};

export type Question = {
  id: string;
  section: string;
  type: QuestionType;
  question: string;
  subtitle?: string;
  placeholder?: string;
  options?: QuestionOption[];
  storesAs: string;
  required: boolean;
  validation?: {
    min?: number;
    max?: number;
    minLength?: number;
    maxLength?: number;
  };
  showIf?: (answers: Record<string, unknown>) => boolean;
  hardBlockIf?: (answers: Record<string, unknown>) => string | null;
  note?: string;
};

export type ScreeningAnswers = Record<string, unknown>;
