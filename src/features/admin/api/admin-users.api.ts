import { apiRequest } from '../../../services/api/client';
import { appendPageQuery, type PageResponse } from '../../../types/pagination.types';
import type { User, UserRole } from '../../auth/types/auth.types';
import type { CreateUserPayload, UpdateUserPayload } from '../types/user-request.types';

export type UserListParams = {
  email?: string;
  q?: string;
  role?: UserRole;
  active?: boolean;
  page?: number;
  size?: number;
  sort?: string;
};

/**
 * GET /api/users — ADMIN only (paginated).
 */
export function listUsersPage(
  accessToken: string,
  params: UserListParams = {},
): Promise<PageResponse<User>> {
  const path = appendPageQuery('/api/users', {
    email: params.email,
    q: params.q,
    role: params.role,
    active: params.active,
    page: params.page ?? 0,
    size: params.size ?? 20,
    sort: params.sort,
  });
  return apiRequest<PageResponse<User>>(path, { accessToken });
}

/** GET /api/users/{id} — ADMIN or account owner. */
export function getUserById(accessToken: string, userId: string): Promise<User> {
  return apiRequest<User>(`/api/users/${userId}`, { accessToken });
}

/** POST /api/users — ADMIN only. */
export function createUser(accessToken: string, payload: CreateUserPayload): Promise<User> {
  return apiRequest<User>('/api/users', {
    method: 'POST',
    accessToken,
    body: payload,
  });
}

/** PUT /api/users/{id} — profile fields and active (ADMIN); role is not updatable. */
export function updateUser(
  accessToken: string,
  userId: string,
  payload: UpdateUserPayload,
): Promise<User> {
  return apiRequest<User>(`/api/users/${userId}`, {
    method: 'PUT',
    accessToken,
    body: payload,
  });
}
