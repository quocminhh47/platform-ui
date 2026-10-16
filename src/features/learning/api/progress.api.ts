import { apiRequest } from '../../../services/api/client';
import type { LessonProgress } from '../types/progress.types';

/** GET /api/courses/{courseId}/progress */
export function listCourseProgress(
  courseId: string,
  accessToken: string,
): Promise<LessonProgress[]> {
  return apiRequest<LessonProgress[]>(`/api/courses/${courseId}/progress`, { accessToken });
}

/** GET /api/courses/{courseId}/lessons/{lessonId}/progress */
export function getLessonProgress(
  courseId: string,
  lessonId: string,
  accessToken: string,
): Promise<LessonProgress> {
  return apiRequest<LessonProgress>(
    `/api/courses/${courseId}/lessons/${lessonId}/progress`,
    { accessToken },
  );
}

/** POST /api/courses/{courseId}/lessons/{lessonId}/progress/complete */
export function completeLessonProgress(
  courseId: string,
  lessonId: string,
  accessToken: string,
): Promise<LessonProgress> {
  return apiRequest<LessonProgress>(
    `/api/courses/${courseId}/lessons/${lessonId}/progress/complete`,
    { method: 'POST', accessToken },
  );
}
