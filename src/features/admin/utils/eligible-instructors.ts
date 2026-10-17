import type { User } from '../../auth/types/auth.types';

/** Active INSTRUCTOR or ADMIN users eligible as course instructors on the backend. */
export function filterEligibleInstructors(users: User[]): User[] {
  return users.filter(
    (user) => user.active && (user.role === 'INSTRUCTOR' || user.role === 'ADMIN'),
  );
}
