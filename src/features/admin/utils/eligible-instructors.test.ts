import { describe, expect, it } from 'vitest';
import type { User } from '../../auth/types/auth.types';
import { filterEligibleInstructors } from './eligible-instructors';

function user(overrides: Partial<User>): User {
  return {
    id: 'u1',
    email: 'a@example.com',
    fullName: 'User',
    role: 'STUDENT',
    avatarUrl: null,
    active: true,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
    ...overrides,
  };
}

describe('filterEligibleInstructors', () => {
  it('includes active INSTRUCTOR and ADMIN users only', () => {
    const result = filterEligibleInstructors([
      user({ id: '1', role: 'INSTRUCTOR' }),
      user({ id: '2', role: 'ADMIN' }),
      user({ id: '3', role: 'STUDENT' }),
      user({ id: '4', role: 'INSTRUCTOR', active: false }),
    ]);

    expect(result.map((item) => item.id)).toEqual(['1', '2']);
  });
});
