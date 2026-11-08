import { apiRequest } from '../../../services/api/client';

export type CourseMetrics = {
  total: number;
  published: number;
  draft: number;
  withLessons: number;
  emptyCurriculum: number;
};

export type StudentMetrics = {
  activeStudentAccounts: number;
};

export type UserMetrics = {
  total: number;
  active: number;
  inactive: number;
};

export function fetchCourseMetrics(accessToken: string): Promise<CourseMetrics> {
  return apiRequest<CourseMetrics>('/api/admin/metrics/courses', { accessToken });
}

export function fetchStudentMetrics(accessToken: string): Promise<StudentMetrics> {
  return apiRequest<StudentMetrics>('/api/admin/metrics/students', { accessToken });
}

export function fetchUserMetrics(accessToken: string): Promise<UserMetrics> {
  return apiRequest<UserMetrics>('/api/admin/metrics/users', { accessToken });
}
