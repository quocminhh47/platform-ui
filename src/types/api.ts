/** Shared API error shape returned by the LMS backend. */
export type ApiErrorBody = {
  timestamp?: string;
  status: number;
  error?: string;
  message: string;
  path?: string;
  details?: string[] | null;
};

export type UserRole = 'STUDENT' | 'INSTRUCTOR' | 'ADMIN';

/** Mirrors backend UserResponse (no password fields). */
export type User = {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  avatarUrl: string | null;
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
