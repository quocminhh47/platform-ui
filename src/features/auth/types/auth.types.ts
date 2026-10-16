export type UserRole = 'STUDENT' | 'INSTRUCTOR' | 'ADMIN';

/** Mirrors backend UserResponse (no password fields). */
export type User = {
  id: string;
  email: string;
  fullName: string;
  firstName?: string | null;
  lastName?: string | null;
  role: UserRole;
  avatarUrl: string | null;
  phone?: string | null;
  dateOfBirth?: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

/** Mirrors backend AuthResponse. */
export type AuthTokens = {
  accessToken: string;
  tokenType: string;
  expiresInMs: number;
};

export type LoginCredentials = {
  /** Email address or phone number. */
  identifier: string;
  password: string;
};

/** Mirrors backend RegisterRequest. confirmPassword is never sent. */
export type RegisterPayload = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  /** ISO date (yyyy-mm-dd). */
  dateOfBirth: string;
  avatarUrl?: string;
};
