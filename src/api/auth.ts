import { apiRequest } from './client';
import type { AuthTokens, User } from '../types/api';

/** GET /api/auth/me — requires a valid Bearer token. */
export function fetchCurrentUser(accessToken: string): Promise<User> {
  return apiRequest<User>('/api/auth/me', { accessToken });
}

/** Placeholders for the next slice (register/login UI). */
export function login(
  email: string,
  password: string,
): Promise<AuthTokens> {
  return apiRequest<AuthTokens>('/api/auth/login', {
    method: 'POST',
    body: { email, password },
  });
}

export function register(payload: {
  email: string;
  password: string;
  fullName: string;
  avatarUrl?: string;
}): Promise<AuthTokens> {
  return apiRequest<AuthTokens>('/api/auth/register', {
    method: 'POST',
    body: payload,
  });
}
