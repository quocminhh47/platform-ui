import { apiRequest } from '../../../services/api/client';
import type { Course } from '../types/course.types';

/**
 * GET /api/courses?published=true
 * Non-admin callers only ever receive published courses.
 */
export function listPublishedCourses(accessToken: string | null): Promise<Course[]> {
  return apiRequest<Course[]>('/api/courses?published=true', { accessToken });
}
