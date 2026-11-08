import type { AdminCourseSort, AdminCourseStatusFilter } from './adminCourseListFilters';
import type { AdminUserSort, AdminUserRoleFilter, AdminUserStatusFilter } from './adminUserListFilters';
import type { UserRole } from '../../auth/types/auth.types';

export function adminCourseStatusToPublished(
  status: AdminCourseStatusFilter,
): boolean | undefined {
  if (status === 'published') {
    return true;
  }
  if (status === 'draft') {
    return false;
  }
  return undefined;
}

export function adminCourseSortToApi(sort: AdminCourseSort): string {
  if (sort === 'oldest') {
    return 'updatedAt,asc';
  }
  if (sort === 'lessons') {
    return 'lessonCount,desc';
  }
  return 'updatedAt,desc';
}

export function adminUserRoleToApi(role: AdminUserRoleFilter): UserRole | undefined {
  if (role === 'all') {
    return undefined;
  }
  return role;
}

export function adminUserStatusToApi(
  status: AdminUserStatusFilter,
): boolean | undefined {
  if (status === 'active') {
    return true;
  }
  if (status === 'inactive') {
    return false;
  }
  return undefined;
}

export function adminUserSortToApi(sort: AdminUserSort): string {
  if (sort === 'name') {
    return 'fullName,asc';
  }
  if (sort === 'oldest') {
    return 'createdAt,asc';
  }
  return 'createdAt,desc';
}
