
export interface Question {
  q: string;
  options: string[];
  correct: number;
}

export type SectionKey = 'comprehension' | 'language' | 'writing';

export interface ExamData {
  [key: string]: Question[];
}

export interface UserAnswer {
  section: SectionKey;
  questionIndex: number;
  selectedOption: number | null;
}

export interface ExamResult {
  right: number;
  wrong: number;
  skipped: number;
  total: number;
  score: number;
}
