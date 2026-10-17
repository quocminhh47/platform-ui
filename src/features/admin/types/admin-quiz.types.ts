/** Mirrors backend QuestionType enum. */
export type QuestionType = 'SINGLE_CHOICE' | 'MULTIPLE_CHOICE' | 'TRUE_FALSE';

/** Mirrors backend QuizAdminOptionResponse. */
export type QuizAdminOption = {
  id: string;
  optionText: string;
  isCorrect: boolean;
};

/** Mirrors backend QuizAdminQuestionResponse. */
export type QuizAdminQuestion = {
  id: string;
  questionText: string;
  questionType: QuestionType;
  scoreWeight: number;
  options: QuizAdminOption[];
};

/** Mirrors backend QuizAdminResponse. */
export type QuizAdmin = {
  quizId: string;
  lessonId: string;
  courseId: string;
  passingScore: number;
  timeLimitMinutes: number | null;
  maxAttempts: number | null;
  finalAssessment: boolean;
  questions: QuizAdminQuestion[];
};

/** Mirrors backend UpsertQuizOptionRequest. */
export type UpsertQuizOptionPayload = {
  optionText: string;
  isCorrect: boolean;
};

/** Mirrors backend UpsertQuizQuestionRequest. */
export type UpsertQuizQuestionPayload = {
  questionText: string;
  questionType: QuestionType;
  scoreWeight?: number | null;
  options: UpsertQuizOptionPayload[];
};

/** Mirrors backend UpsertQuizRequest. */
export type UpsertQuizPayload = {
  passingScore: number;
  timeLimitMinutes?: number | null;
  maxAttempts?: number | null;
  questions?: UpsertQuizQuestionPayload[] | null;
};
