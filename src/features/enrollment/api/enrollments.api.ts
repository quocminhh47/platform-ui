import { apiRequest } from '../../../services/api/client';

/** Matches backend EnrollmentStatus. */
export type EnrollmentStatus = 'PENDING' | 'ACTIVE' | 'COMPLETED' | 'DROPPED';

/**
 * Matches backend EnrollmentResponse.
 * There is no thumbnail, price, or progress field.
 */
export type Enrollment = {
  id: string;
  userId: string;
  courseId: string;
  courseTitle: string;
  status: EnrollmentStatus;
  enrolledAt: string;
};

/** GET /api/enrollments/me */
export function listMyEnrollments(accessToken: string): Promise<Enrollment[]> {
  return apiRequest<Enrollment[]>('/api/enrollments/me', { accessToken });
}

/** POST /api/courses/{courseId}/enrollments — no request body. */
export function enrollInCourse(courseId: string, accessToken: string): Promise<Enrollment> {
  return apiRequest<Enrollment>(`/api/courses/${courseId}/enrollments`, {
    method: 'POST',
    accessToken,
  });
}
