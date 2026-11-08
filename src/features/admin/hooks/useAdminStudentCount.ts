import { useCallback, useEffect, useState } from 'react';
import { ApiError } from '../../../services/api/api-error';
import { useAuth } from '../../auth/hooks/useAuth';
import { fetchStudentMetrics } from '../api/admin-metrics.api';

export type AdminStudentCountState = {
  count: number | null;
  loading: boolean;
  error: string | null;
  reload: () => void;
};

function studentCountMessage(cause: unknown): string {
  if (cause instanceof ApiError && cause.status === 401) {
    return 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
  }
  if (cause instanceof ApiError && cause.status === 403) {
    return 'Bạn không có quyền xem danh sách người dùng.';
  }
  if (cause instanceof ApiError) {
    return 'Không thể tải số tài khoản học viên. Thử lại sau.';
  }
  return 'Không kết nối được máy chủ. Kiểm tra mạng và thử lại.';
}

export function useAdminStudentCount(enabled: boolean): AdminStudentCountState {
  const { accessToken } = useAuth();
  const [count, setCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);
  const [requestId, setRequestId] = useState(0);

  const reload = useCallback(() => {
    setRequestId((current) => current + 1);
  }, []);

  useEffect(() => {
    if (!enabled || !accessToken) {
      setLoading(false);
      setCount(null);
      setError(null);
      return;
    }

    let active = true;
    setLoading(true);
    setError(null);

    fetchStudentMetrics(accessToken)
      .then((metrics) => {
        if (!active) {
          return;
        }
        setCount(metrics.activeStudentAccounts);
        setError(null);
      })
      .catch((cause: unknown) => {
        if (!active) {
          return;
        }
        setCount(null);
        setError(studentCountMessage(cause));
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [enabled, accessToken, requestId]);

  return { count, loading, error, reload };
}
