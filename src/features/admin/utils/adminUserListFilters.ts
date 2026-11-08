import type { User, UserRole } from '../../auth/types/auth.types';

export type AdminUserRoleFilter = 'all' | UserRole;
export type AdminUserStatusFilter = 'all' | 'active' | 'inactive';
export type AdminUserSort = 'newest' | 'oldest' | 'name';

export function filterAndSortAdminUsers(
  users: User[],
  query: string,
  role: AdminUserRoleFilter,
  status: AdminUserStatusFilter,
  sort: AdminUserSort,
): User[] {
  const normalized = query.trim().toLowerCase();
  let result = users.filter((user) => {
    if (role !== 'all' && user.role !== role) {
      return false;
    }
    if (status === 'active' && !user.active) {
      return false;
    }
    if (status === 'inactive' && user.active) {
      return false;
    }
    if (!normalized) {
      return true;
    }
    const haystack = [user.fullName, user.email, user.phone ?? '', user.id].join(' ').toLowerCase();
    return haystack.includes(normalized);
  });

  result = [...result].sort((a, b) => compareUsers(a, b, sort));
  return result;
}

function compareUsers(a: User, b: User, sort: AdminUserSort): number {
  if (sort === 'name') {
    return a.fullName.localeCompare(b.fullName, 'vi');
  }
  const aTime = Date.parse(a.createdAt);
  const bTime = Date.parse(b.createdAt);
  if (sort === 'oldest') {
    return aTime - bTime;
  }
  return bTime - aTime;
}

export function countUsersByStatus(users: User[]): { active: number; inactive: number } {
  let active = 0;
  let inactive = 0;
  for (const user of users) {
    if (user.active) {
      active += 1;
    } else {
      inactive += 1;
    }
  }
  return { active, inactive };
}
