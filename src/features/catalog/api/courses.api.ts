import { apiRequest } from '../../../services/api/client';
import { appendPageQuery, type PageResponse } from '../../../types/pagination.types';
import type { Course } from '../types/course.types';
import type { Lesson } from '../types/lesson.types';
import type { Section } from '../types/section.types';

export type CourseListParams = {
  published?: boolean;
  instructorId?: string;
  q?: string;
  page?: number;
  size?: number;
  sort?: string;
};

/** GET /api/courses — paginated list with optional filters. */
export function listCoursesPage(
  accessToken: string | null,
  params: CourseListParams = {},
): Promise<PageResponse<Course>> {
  const path = appendPageQuery('/api/courses', {
    published: params.published,
    instructorId: params.instructorId,
    q: params.q,
    page: params.page ?? 0,
    size: params.size ?? 20,
    sort: params.sort,
  });
  return apiRequest<PageResponse<Course>>(path, { accessToken });
}

/**
 * Convenience helper for callers that only need the first page of published courses.
 */
export async function listPublishedCourses(
  accessToken: string | null,
  options: { page?: number; size?: number; q?: string; sort?: string } = {},
): Promise<Course[]> {
  const page = await listCoursesPage(accessToken, {
    published: true,
    page: options.page ?? 0,
    size: options.size ?? 20,
    q: options.q,
    sort: options.sort,
  });
  return page.content;
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
