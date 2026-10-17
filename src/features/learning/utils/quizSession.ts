import type {
  QuizAttemptResultResponse,
  QuizAttemptTakeResponse,
} from '../types/quiz.types';

export function isQuizTakeResponse(
  payload: QuizAttemptTakeResponse | QuizAttemptResultResponse,
): payload is QuizAttemptTakeResponse {
  return payload.status === 'IN_PROGRESS';
}

/** Build display-only take snapshot from a submitted result (no timer). */
export function takeSnapshotFromResult(
  result: QuizAttemptResultResponse,
): QuizAttemptTakeResponse | null {
  if (!result.questions?.length) {
    return null;
  }
  return {
    attemptId: result.attemptId,
    quizId: result.quizId,
    lessonId: result.lessonId,
    status: result.status,
    startedAt: result.startedAt,
    expiresAt: null,
    serverNow: result.startedAt,
    timeLimitMinutes: null,
    passingScore: result.passingScore,
    maxAttempts: result.maxAttempts,
    attemptsUsed: result.attemptsUsed,
    finalAssessment: result.finalAssessment,
    questions: result.questions,
  };
}
