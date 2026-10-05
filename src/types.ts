export interface Step {
  stepNumber: number;
  title: string;
  explanation: string;
  formulaOrEquation?: string;
}

export interface SolvedQuestion {
  questionNumber: number;
  questionText: string;
  isMultipleChoice: boolean;
  correctOption?: string;
  finalAnswer: string;
  steps: Step[];
  explanation: string;
  keyConceptOrFormula?: string;
}

export interface PracticeQuestion {
  question: string;
  options?: string[];
  correctAnswer: string;
  explanation: string;
}

export interface SolveResult {
  isReadable: boolean;
  unclearReason?: string;
  detectedSubject: string;
  detectedLanguage: string;
  summary: string;
  questions: SolvedQuestion[];
  tipsOrNotes?: string;
  practiceQuestion?: PracticeQuestion;
}

export interface HistoryItem {
  id: string;
  timestamp: number;
  imageThumbnail: string; // low-res thumbnail or data URL
  subject: string;
  summary: string;
  result: SolveResult;
}
