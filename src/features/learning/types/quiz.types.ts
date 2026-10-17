/** Mirrors backend QuizAttemptStatus. */
export type QuizAttemptStatus = 'IN_PROGRESS' | 'SUBMITTED' | 'EXPIRED';

/** Mirrors backend QuestionType. */
export type QuizQuestionType = 'SINGLE_CHOICE' | 'MULTIPLE_CHOICE' | 'TRUE_FALSE';

export type QuizOptionStudentView = {
  id: string;
  optionText: string;
};

export type QuizQuestionStudentView = {
  id: string;
  questionText: string;
  questionType: QuizQuestionType;
  options: QuizOptionStudentView[];
};

export type QuizAttemptTakeResponse = {
  attemptId: string;
  quizId: string;
  lessonId: string;
  status: QuizAttemptStatus;
  startedAt: string;
  expiresAt: string | null;
  serverNow: string;
  timeLimitMinutes: number | null;
  passingScore: number;
  maxAttempts: number | null;
  attemptsUsed: number;
  finalAssessment: boolean;
  questions: QuizQuestionStudentView[];
};

export type QuizAttemptAnswerResultView = {
  questionId: string;
  selectedOptionIds: string[];
};

export type QuizAttemptResultResponse = {
  attemptId: string;
  quizId: string;
  lessonId: string;
  status: QuizAttemptStatus;
  score: number;
  passed: boolean;
  passingScore: number;
  startedAt: string;
  submittedAt: string;
  finalAssessment: boolean;
  bestScore: number | null;
  bestPassed: boolean;
  maxAttempts: number | null;
  attemptsUsed: number;
  answers: QuizAttemptAnswerResultView[];
  questions?: QuizQuestionStudentView[];
};

export type SubmitQuizAnswerRequest = {
  questionId: string;
  selectedOptionIds: string[];
};

export type SubmitQuizAttemptRequest = {
  answers: SubmitQuizAnswerRequest[];
};
