import { useCallback, useEffect, useState } from 'react';
import { ApiError } from '../../../services/api/api-error';
import { useAuth } from '../../auth/hooks/useAuth';
import { fetchUserMetrics, type UserMetrics } from '../api/admin-metrics.api';

export type AdminUserMetricsState = {
  metrics: UserMetrics | null;
  loading: boolean;
  error: string | null;
  reload: () => void;
};

function metricsMessage(cause: unknown): string {
  if (cause instanceof ApiError) {
    return 'Không thể tải thống kê người dùng. Thử lại sau.';
  }
  return 'Không kết nối được máy chủ. Kiểm tra mạng và thử lại.';
}

export function useAdminUserMetrics(enabled: boolean): AdminUserMetricsState {
  const { accessToken } = useAuth();
  const [metrics, setMetrics] = useState<UserMetrics | null>(null);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);
  const [requestId, setRequestId] = useState(0);

  const reload = useCallback(() => {
    setRequestId((current) => current + 1);
  }, []);

  useEffect(() => {
    if (!enabled || !accessToken) {
      setLoading(false);
      setMetrics(null);
      setError(null);
      return;
    }

    let active = true;
    setLoading(true);
    setError(null);

    fetchUserMetrics(accessToken)
      .then((result) => {
        if (!active) {
          return;
        }
        setMetrics(result);
        setError(null);
      })
      .catch((cause: unknown) => {
        if (!active) {
          return;
        }
        setMetrics(null);
        setError(metricsMessage(cause));
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

  return { metrics, loading, error, reload };
}
