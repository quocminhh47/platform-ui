import type { BreadcrumbItem } from '../components/common/Breadcrumb';

export const breadcrumbHome = (): BreadcrumbItem => ({ label: 'Trang chủ', href: '/' });

export const breadcrumbCourses = (): BreadcrumbItem => ({
  label: 'Khóa học',
  href: '/courses',
});

export const breadcrumbArticles = (): BreadcrumbItem => ({
  label: 'Bài viết',
  href: '/articles',
});

export function breadcrumbArticleTitle(title: string): BreadcrumbItem {
  return { label: title.trim() || 'Bài viết' };
}

export const breadcrumbMyCourses = (): BreadcrumbItem => ({
  label: 'Khóa học của tôi',
  href: '/my-courses',
});

export const breadcrumbMyArticles = (): BreadcrumbItem => ({
  label: 'Bài viết của tôi',
  href: '/my-articles',
});

export const breadcrumbDashboard = (): BreadcrumbItem => ({
  label: 'Bảng điều khiển',
  href: '/dashboard',
});

export const breadcrumbAccount = (): BreadcrumbItem => ({
  label: 'Hồ sơ cá nhân',
  href: '/account',
});

export const breadcrumbAdminOverview = (): BreadcrumbItem => ({
  label: 'Tổng quan quản trị',
  href: '/admin',
});

export const breadcrumbAdminCourses = (): BreadcrumbItem => ({
  label: 'Quản trị khóa học',
  href: '/admin/courses',
});

export const breadcrumbAdminUsers = (): BreadcrumbItem => ({
  label: 'Quản lý người dùng',
  href: '/admin/users',
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
