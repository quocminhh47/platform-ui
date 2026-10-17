import { apiRequest } from '../../../services/api/client';
import type { Course } from '../../catalog/types/course.types';
import type { CreateCoursePayload, UpdateCoursePayload } from '../types/course-request.types';

/**
 * GET /api/courses
 * ADMIN callers receive published and unpublished courses when no filter is applied.
 */
export function listAllCourses(accessToken: string): Promise<Course[]> {
  return apiRequest<Course[]>('/api/courses', { accessToken });
}

/** POST /api/courses — ADMIN only. */
export function createCourse(
  accessToken: string,
  payload: CreateCoursePayload,
): Promise<Course> {
  return apiRequest<Course>('/api/courses', {
    method: 'POST',
    accessToken,
    body: payload,
  });
}

/** PUT /api/courses/{courseId} — ADMIN only. */
export function updateCourse(
  accessToken: string,
  courseId: string,
  payload: UpdateCoursePayload,
): Promise<Course> {
  return apiRequest<Course>(`/api/courses/${courseId}`, {
    method: 'PUT',
    accessToken,
    body: payload,
  });
}

/** POST /api/courses/{courseId}/publish — ADMIN only. */
export function publishCourse(accessToken: string, courseId: string): Promise<Course> {
  return apiRequest<Course>(`/api/courses/${courseId}/publish`, {
    method: 'POST',
    accessToken,
  });
}

/** POST /api/courses/{courseId}/unpublish — ADMIN only. */
export function unpublishCourse(accessToken: string, courseId: string): Promise<Course> {
  return apiRequest<Course>(`/api/courses/${courseId}/unpublish`, {
    method: 'POST',
    accessToken,
  });
}
