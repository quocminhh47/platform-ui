import { apiRequest } from '../../../services/api/client';
import type { AuthTokens, LoginCredentials, RegisterPayload, User } from '../types/auth.types';

/** GET /api/auth/me — requires a valid Bearer token. */
export function fetchCurrentUser(accessToken: string): Promise<User> {
  return apiRequest<User>('/api/auth/me', { accessToken });
}

/** POST /api/auth/login */
export function login(credentials: LoginCredentials): Promise<AuthTokens> {
  return apiRequest<AuthTokens>('/api/auth/login', {
    method: 'POST',
    body: credentials,
  });
}

/** POST /api/auth/register — always creates STUDENT on the backend. */
export function register(payload: RegisterPayload): Promise<AuthTokens> {
  return apiRequest<AuthTokens>('/api/auth/register', {
    method: 'POST',
    body: payload,
  });
}
