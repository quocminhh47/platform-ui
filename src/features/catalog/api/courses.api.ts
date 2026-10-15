import { apiRequest } from '../../../services/api/client';
import type { Course } from '../types/course.types';
import type { Lesson } from '../types/lesson.types';
import type { Section } from '../types/section.types';

/**
 * GET /api/courses?published=true
 * Non-admin callers only ever receive published courses.
 */
export function listPublishedCourses(accessToken: string | null): Promise<Course[]> {
  return apiRequest<Course[]>('/api/courses?published=true', { accessToken });
}

/** GET /api/courses/{id} — unpublished courses return 404 for non-admin callers. */
export function getCourseById(
  courseId: string,
  accessToken: string | null,
): Promise<Course> {
  return apiRequest<Course>(`/api/courses/${courseId}`, { accessToken });
}

/** GET /api/courses/{courseId}/sections */
export function listCourseSections(
  courseId: string,
  accessToken: string | null,
): Promise<Section[]> {
  return apiRequest<Section[]>(`/api/courses/${courseId}/sections`, { accessToken });
}

/** GET /api/courses/{courseId}/sections/{sectionId}/lessons */
export function listSectionLessons(
  courseId: string,
  sectionId: string,
  accessToken: string | null,
): Promise<Lesson[]> {
  return apiRequest<Lesson[]>(
    `/api/courses/${courseId}/sections/${sectionId}/lessons`,
    { accessToken },
  );
}
