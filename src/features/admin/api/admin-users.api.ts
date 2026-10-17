import { apiRequest } from '../../../services/api/client';
import type { User } from '../../auth/types/auth.types';

/**
 * GET /api/users — ADMIN only.
 * Optional email filter is supported by the backend; role filtering is not.
 */
export function listUsers(accessToken: string, email?: string): Promise<User[]> {
  const path =
    email !== undefined && email.trim() !== ''
      ? `/api/users?email=${encodeURIComponent(email.trim())}`
      : '/api/users';
  return apiRequest<User[]>(path, { accessToken });
}
