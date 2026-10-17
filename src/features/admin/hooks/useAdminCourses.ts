import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../../auth/hooks/useAuth';
import { listAllCourses } from '../api/admin-courses.api';
import type { Course } from '../../catalog/types/course.types';
import { adminCoursesLoadMessage } from '../utils/admin-messages';

export type AdminCoursesState = {
  courses: Course[] | null;
  loading: boolean;
  error: string | null;
  reload: () => void;
  refresh: () => Promise<Course[]>;
};

export function useAdminCourses(enabled: boolean): AdminCoursesState {
  const { accessToken } = useAuth();
  const [courses, setCourses] = useState<Course[] | null>(null);
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
      setCourses(null);
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
      setCourses(null);
      return [];
    }
    const result = await listAllCourses(accessToken);
    setCourses(result);
    setError(null);
    setLoading(false);
    return result;
  }, [accessToken]);

  useEffect(() => {
    if (!enabled || !accessToken) {
      return;
    }

    let active = true;

    listAllCourses(accessToken)
      .then((result) => {
        if (!active) {
          return;
        }
        setCourses(result);
        setError(null);
      })
      .catch((cause: unknown) => {
        if (!active) {
          return;
        }
        setCourses(null);
        setError(adminCoursesLoadMessage(cause));
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

  return { courses, loading, error, reload, refresh };
}
