import { apiRequest } from '../../../services/api/client';
import type { QuizAdmin, UpsertQuizPayload } from '../types/admin-quiz.types';

/** GET /api/courses/{courseId}/lessons/{lessonId}/quiz — ADMIN only. */
export function getQuiz(
  accessToken: string,
  courseId: string,
  lessonId: string,
): Promise<QuizAdmin> {
  return apiRequest<QuizAdmin>(`/api/courses/${courseId}/lessons/${lessonId}/quiz`, {
    accessToken,
  });
}

/** PUT /api/courses/{courseId}/lessons/{lessonId}/quiz — ADMIN only. */
export function upsertQuiz(
  accessToken: string,
  courseId: string,
  lessonId: string,
  payload: UpsertQuizPayload,
): Promise<QuizAdmin> {
  return apiRequest<QuizAdmin>(`/api/courses/${courseId}/lessons/${lessonId}/quiz`, {
    method: 'PUT',
    accessToken,
    body: payload,
  });
}
