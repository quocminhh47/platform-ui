import { useCallback, useEffect, useState } from 'react';
import { ApiError } from '../../../services/api/api-error';
import { useAuth } from '../../auth/hooks/useAuth';
import { fetchCourseMetrics, type CourseMetrics } from '../api/admin-metrics.api';

export type AdminCourseMetricsState = {
  metrics: CourseMetrics | null;
  loading: boolean;
  error: string | null;
  reload: () => void;
};

function metricsMessage(cause: unknown): string {
  if (cause instanceof ApiError && cause.status === 403) {
    return 'Bạn không có quyền xem thống kê khóa học.';
  }
  if (cause instanceof ApiError) {
    return 'Không thể tải thống kê khóa học. Thử lại sau.';
  }
  return 'Không kết nối được máy chủ. Kiểm tra mạng và thử lại.';
}

export function useAdminCourseMetrics(enabled: boolean): AdminCourseMetricsState {
  const { accessToken } = useAuth();
  const [metrics, setMetrics] = useState<CourseMetrics | null>(null);
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

    fetchCourseMetrics(accessToken)
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
