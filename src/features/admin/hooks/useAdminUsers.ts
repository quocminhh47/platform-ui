import { useCallback, useEffect, useRef, useState } from 'react';
import { ApiError } from '../../../services/api/api-error';
import type { PageResponse } from '../../../types/pagination.types';
import { useDebouncedValue } from '../../../hooks/useDebouncedValue';
import { useAuth } from '../../auth/hooks/useAuth';
import type { User } from '../../auth/types/auth.types';
import { listUsersPage } from '../api/admin-users.api';
import {
  adminUserRoleToApi,
  adminUserSortToApi,
  adminUserStatusToApi,
} from '../utils/adminListQueryMappers';
import type {
  AdminUserRoleFilter,
  AdminUserSort,
  AdminUserStatusFilter,
} from '../utils/adminUserListFilters';

export type AdminUsersQuery = {
  q: string;
  role: AdminUserRoleFilter;
  status: AdminUserStatusFilter;
  sort: AdminUserSort;
  page: number;
  size: number;
};

export type AdminUsersState = {
  page: PageResponse<User> | null;
  loading: boolean;
  error: string | null;
  reload: () => void;
  refresh: () => Promise<PageResponse<User> | null>;
};

const DEFAULT_QUERY: AdminUsersQuery = {
  q: '',
  role: 'all',
  status: 'all',
  sort: 'newest',
  page: 0,
  size: 20,
};

function usersLoadMessage(cause: unknown): string {
  if (cause instanceof ApiError && cause.status === 401) {
    return 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
  }
  if (cause instanceof ApiError && cause.status === 403) {
    return 'Bạn không có quyền xem danh sách người dùng.';
  }
  if (cause instanceof ApiError) {
    return 'Không thể tải danh sách người dùng. Thử lại sau.';
  }
  return 'Không kết nối được máy chủ. Kiểm tra mạng và thử lại.';
}

export function useAdminUsers(
  enabled: boolean,
  query: AdminUsersQuery = DEFAULT_QUERY,
): AdminUsersState {
  const { accessToken } = useAuth();
  const debouncedQ = useDebouncedValue(query.q, 300);
  const [page, setPage] = useState<PageResponse<User> | null>(null);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);
  const [requestId, setRequestId] = useState(0);
  const fetchGeneration = useRef(0);

  const reload = useCallback(() => {
    setRequestId((current) => current + 1);
  }, []);

  const apiParams = {
    q: debouncedQ.trim() || undefined,
    role: adminUserRoleToApi(query.role),
    active: adminUserStatusToApi(query.status),
    sort: adminUserSortToApi(query.sort),
    page: query.page,
    size: query.size,
  };

  const refresh = useCallback(async () => {
    if (!accessToken) {
      setPage(null);
      return null;
    }
    const result = await listUsersPage(accessToken, apiParams);
    setPage(result);
    setError(null);
    setLoading(false);
    return result;
  }, [accessToken, apiParams]);

  useEffect(() => {
    if (!enabled || !accessToken) {
      setLoading(false);
      setPage(null);
      setError(null);
      return;
    }

    const generation = ++fetchGeneration.current;
    setLoading(true);
    setError(null);

    listUsersPage(accessToken, apiParams)
      .then((result) => {
        if (generation !== fetchGeneration.current) {
          return;
        }
        setPage(result);
        setError(null);
      })
      .catch((cause: unknown) => {
        if (generation !== fetchGeneration.current) {
          return;
        }
        setPage(null);
        setError(usersLoadMessage(cause));
      })
      .finally(() => {
        if (generation === fetchGeneration.current) {
          setLoading(false);
        }
      });
  }, [
    enabled,
    accessToken,
    requestId,
    debouncedQ,
    query.role,
    query.status,
    query.sort,
    query.page,
    query.size,
  ]);

  return { page, loading, error, reload, refresh };
}
