import { describe, expect, it } from 'vitest';
import type { User } from '../../auth/types/auth.types';
import { filterAndSortAdminUsers } from './adminUserListFilters';

const base: User = {
  id: 'u1',
  email: 'a@example.com',
  fullName: 'Alpha User',
  role: 'STUDENT',
  avatarUrl: null,
  active: true,
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
};

describe('filterAndSortAdminUsers', () => {
  it('filters by query, role, and status', () => {
    const users = [
      base,
      {
        ...base,
        id: 'u2',
        fullName: 'Beta',
        email: 'b@example.com',
        role: 'ADMIN' as const,
        active: false,
      },
    ];
    expect(
      filterAndSortAdminUsers(users, 'beta', 'all', 'all', 'name').map((u) => u.id),
    ).toEqual(['u2']);
    expect(filterAndSortAdminUsers(users, '', 'ADMIN', 'all', 'name').map((u) => u.id)).toEqual([
      'u2',
    ]);
    expect(filterAndSortAdminUsers(users, '', 'all', 'inactive', 'name').map((u) => u.id)).toEqual([
      'u2',
    ]);
  });

  it('sorts by name and created date', () => {
    const users = [
      { ...base, id: 'a', fullName: 'Zeta', createdAt: '2026-01-03T00:00:00Z' },
      { ...base, id: 'b', fullName: 'Alpha', createdAt: '2026-01-01T00:00:00Z' },
    ];
    expect(filterAndSortAdminUsers(users, '', 'all', 'all', 'name').map((u) => u.id)).toEqual([
      'b',
      'a',
    ]);
    expect(filterAndSortAdminUsers(users, '', 'all', 'all', 'oldest').map((u) => u.id)).toEqual([
      'b',
      'a',
    ]);
  });
});
