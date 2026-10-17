import { apiRequest } from '../../../services/api/client';
import type { Section } from '../../catalog/types/section.types';
import type { CreateSectionPayload, UpdateSectionPayload } from '../types/section-request.types';

/** GET /api/courses/{courseId}/sections */
export function listCourseSections(accessToken: string, courseId: string): Promise<Section[]> {
  return apiRequest<Section[]>(`/api/courses/${courseId}/sections`, { accessToken });
}

/** POST /api/courses/{courseId}/sections — ADMIN only. */
export function createSection(
  accessToken: string,
  courseId: string,
  payload: CreateSectionPayload,
): Promise<Section> {
  return apiRequest<Section>(`/api/courses/${courseId}/sections`, {
    method: 'POST',
    accessToken,
    body: payload,
  });
}

/** PUT /api/courses/{courseId}/sections/{sectionId} — ADMIN only. */
export function updateSection(
  accessToken: string,
  courseId: string,
  sectionId: string,
  payload: UpdateSectionPayload,
): Promise<Section> {
  return apiRequest<Section>(`/api/courses/${courseId}/sections/${sectionId}`, {
    method: 'PUT',
    accessToken,
    body: payload,
  });
}
