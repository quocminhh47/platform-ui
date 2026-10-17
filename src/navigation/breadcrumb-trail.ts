import type { BreadcrumbItem } from '../components/common/Breadcrumb';

export const breadcrumbHome = (): BreadcrumbItem => ({ label: 'Trang chủ', href: '/' });

export const breadcrumbCourses = (): BreadcrumbItem => ({
  label: 'Khóa học',
  href: '/courses',
});

export const breadcrumbMyCourses = (): BreadcrumbItem => ({
  label: 'Khóa học của tôi',
  href: '/my-courses',
});

export const breadcrumbDashboard = (): BreadcrumbItem => ({
  label: 'Bảng điều khiển',
  href: '/dashboard',
});

export const breadcrumbAccount = (): BreadcrumbItem => ({
  label: 'Hồ sơ cá nhân',
  href: '/account',
});

export const breadcrumbAdminCourses = (): BreadcrumbItem => ({
  label: 'Quản trị khóa học',
  href: '/admin/courses',
});

export function breadcrumbCourseTitle(
  courseId: string,
  title: string | null | undefined,
  loading: boolean,
): BreadcrumbItem {
  const label = loading ? 'Đang tải…' : title?.trim() || 'Khóa học';
  return { label, href: `/courses/${courseId}` };
}

export function breadcrumbAdminCourse(
  courseId: string,
  title: string | null | undefined,
  loading: boolean,
): BreadcrumbItem {
  const label = loading ? 'Đang tải…' : title?.trim() || 'Khóa học';
  return { label, href: `/admin/courses/${courseId}` };
}
