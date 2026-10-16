import { useCallback, useEffect, useState } from 'react';
import { ApiError } from '../../../services/api/api-error';
import { useAuth } from '../../auth/hooks/useAuth';
import { listMyEnrollments } from '../api/enrollments.api';
import type { Enrollment } from '../api/enrollments.api';

export type MyEnrollmentsState = {
  enrollments: Enrollment[] | null;
  loading: boolean;
  error: string | null;
  reload: () => void;
  /** Refetch and return the list. Used after a 409 to reconcile, not assume success. */
  refresh: () => Promise<Enrollment[]>;
};

export function useMyEnrollments(enabled: boolean): MyEnrollmentsState {
  const { accessToken } = useAuth();
  const [enrollments, setEnrollments] = useState<Enrollment[] | null>(null);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);
  const [requestId, setRequestId] = useState(0);
  const [query, setQuery] = useState({ enabled, accessToken, requestId });

  if (
    query.enabled !== enabled ||
    query.accessToken !== accessToken ||
    query.requestId !== requestId
  ) {
    setQuery({ enabled, accessToken, requestId });
    if (!enabled || !accessToken) {
      setLoading(false);
      setError(null);
      setEnrollments(null);
    } else {
      setLoading(true);
      setError(null);
    }
  }

  const reload = useCallback(() => {
    setRequestId((current) => current + 1);
  }, []);

  const refresh = useCallback(async () => {
    if (!accessToken) {
      setEnrollments(null);
      return [];
    }
    const result = await listMyEnrollments(accessToken);
    setEnrollments(result);
    setError(null);
    setLoading(false);
    return result;
  }, [accessToken]);

  useEffect(() => {
    if (!enabled || !accessToken) {
      return;
    }

    let active = true;

    listMyEnrollments(accessToken)
      .then((result) => {
        if (!active) {
          return;
        }
        setEnrollments(result);
        setError(null);
      })
      .catch((cause: unknown) => {
        if (!active) {
          return;
        }
        setEnrollments(null);
        setError(enrollmentLoadMessage(cause));
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

  return { enrollments, loading, error, reload, refresh };
}

export function enrollmentLoadMessage(cause: unknown): string {
  if (cause instanceof ApiError && cause.status === 401) {
    return 'Your session has expired. Sign in again.';
  }
  if (cause instanceof ApiError) {
    return 'Your enrollments could not be loaded. Try again in a moment.';
  }
  return 'Unable to reach the server. Check your connection and try again.';
}
