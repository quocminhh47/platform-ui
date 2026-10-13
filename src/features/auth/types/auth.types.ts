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

export type LoginCredentials = {
  email: string;
  password: string;
};

export type RegisterPayload = {
  email: string;
  password: string;
  fullName: string;
  avatarUrl?: string;
};
