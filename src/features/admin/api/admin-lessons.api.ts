import { apiRequest } from '../../../services/api/client';
import type { Lesson } from '../../catalog/types/lesson.types';
import type { CreateLessonPayload, UpdateLessonPayload } from '../types/lesson-request.types';

/** GET /api/courses/{courseId}/sections/{sectionId}/lessons */
export function listSectionLessons(
  accessToken: string,
  courseId: string,
  sectionId: string,
): Promise<Lesson[]> {
  return apiRequest<Lesson[]>(
    `/api/courses/${courseId}/sections/${sectionId}/lessons`,
    { accessToken },
  );
}

/** POST /api/courses/{courseId}/sections/{sectionId}/lessons — ADMIN only. */
export function createLesson(
  accessToken: string,
  courseId: string,
  sectionId: string,
  payload: CreateLessonPayload,
): Promise<Lesson> {
  return apiRequest<Lesson>(
    `/api/courses/${courseId}/sections/${sectionId}/lessons`,
    {
      method: 'POST',
      accessToken,
      body: payload,
    },
  );
}

/** PUT /api/courses/{courseId}/sections/{sectionId}/lessons/{lessonId} — ADMIN only. */
export function updateLesson(
  accessToken: string,
  courseId: string,
  sectionId: string,
  lessonId: string,
  payload: UpdateLessonPayload,
): Promise<Lesson> {
  return apiRequest<Lesson>(
    `/api/courses/${courseId}/sections/${sectionId}/lessons/${lessonId}`,
    {
      method: 'PUT',
      accessToken,
      body: payload,
    },
  );
}
