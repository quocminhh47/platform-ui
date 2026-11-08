import type { UserRole } from '../../auth/types/auth.types';

/** Mirrors backend CreateUserRequest. */
export type CreateUserPayload = {
  email: string;
  password: string;
  fullName: string;
  role: UserRole;
  avatarUrl?: string | null;
  phone?: string | null;
  /** ISO date yyyy-mm-dd. */
  dateOfBirth?: string | null;
};

/** Mirrors backend UpdateUserRequest (role is not updatable). */
export type UpdateUserPayload = {
  fullName?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  avatarUrl?: string | null;
  phone?: string | null;
  dateOfBirth?: string | null;
  active?: boolean | null;
};
