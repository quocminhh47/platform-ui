import { apiRequest } from '../../../services/api/client';
import type { Lesson } from '../../catalog/types/lesson.types';

/**
 * GET /api/courses/{courseId}/sections/{sectionId}/lessons/{lessonId}
 * Full lesson content. Requires ACTIVE or COMPLETED enrollment (or ADMIN).
 * Public lesson lists omit contentUrl and must not be used for playback.
 */
export function getLessonContent(
  courseId: string,
  sectionId: string,
  lessonId: string,
  accessToken: string,
): Promise<Lesson> {
  return apiRequest<Lesson>(
    `/api/courses/${courseId}/sections/${sectionId}/lessons/${lessonId}`,
    { accessToken },
  );
}
