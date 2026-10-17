import { apiRequest } from '../../../services/api/client';
import type {
  QuizAttemptResultResponse,
  QuizAttemptTakeResponse,
  SubmitQuizAttemptRequest,
} from '../types/quiz.types';

function attemptsPath(courseId: string, lessonId: string): string {
  return `/api/courses/${courseId}/lessons/${lessonId}/quiz-attempts`;
}

/** GET — in-progress take or latest submitted result (does not start a new attempt). */
export function getQuizSession(
  courseId: string,
  lessonId: string,
  accessToken: string,
): Promise<QuizAttemptTakeResponse | QuizAttemptResultResponse> {
  return apiRequest<QuizAttemptTakeResponse | QuizAttemptResultResponse>(
    `${attemptsPath(courseId, lessonId)}/session`,
    { accessToken },
  );
}

/** POST — start or resume an in-progress attempt. */
export function startOrResumeQuizAttempt(
  courseId: string,
  lessonId: string,
  accessToken: string,
): Promise<QuizAttemptTakeResponse> {
  return apiRequest<QuizAttemptTakeResponse>(attemptsPath(courseId, lessonId), {
    method: 'POST',
    accessToken,
  });
}

export function getCurrentQuizAttempt(
  courseId: string,
  lessonId: string,
  accessToken: string,
): Promise<QuizAttemptTakeResponse> {
  return apiRequest<QuizAttemptTakeResponse>(`${attemptsPath(courseId, lessonId)}/current`, {
    accessToken,
  });
}

export function getQuizAttempt(
  courseId: string,
  lessonId: string,
  attemptId: string,
  accessToken: string,
): Promise<QuizAttemptTakeResponse | QuizAttemptResultResponse> {
  return apiRequest<QuizAttemptTakeResponse | QuizAttemptResultResponse>(
    `${attemptsPath(courseId, lessonId)}/${attemptId}`,
    { accessToken },
  );
}

export function submitQuizAttempt(
  courseId: string,
  lessonId: string,
  attemptId: string,
  body: SubmitQuizAttemptRequest,
  accessToken: string,
): Promise<QuizAttemptResultResponse> {
  return apiRequest<QuizAttemptResultResponse>(
    `${attemptsPath(courseId, lessonId)}/${attemptId}/submit`,
    { method: 'POST', body, accessToken },
  );
}
