import { useCallback, useEffect, useState } from 'react';
import { ApiError } from '../../../services/api/api-error';
import { useAuth } from '../../auth/hooks/useAuth';
import { getCourseById } from '../../catalog/api/courses.api';
import type { Course } from '../../catalog/types/course.types';
import { adminCourseLoadMessage } from '../utils/admin-form-messages';

export type AdminCourseDetailState = {
  course: Course | null;
  loading: boolean;
  notFound: boolean;
  error: string | null;
  reload: () => void;
};

export function useAdminCourseDetail(
  courseId: string | undefined,
  enabled: boolean,
): AdminCourseDetailState {
  const { accessToken } = useAuth();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(enabled && Boolean(courseId));
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [requestId, setRequestId] = useState(0);
  const [query, setQuery] = useState({ courseId, accessToken, enabled, requestId });

  if (
    query.courseId !== courseId ||
    query.accessToken !== accessToken ||
    query.enabled !== enabled ||
    query.requestId !== requestId
  ) {
    setQuery({ courseId, accessToken, enabled, requestId });
    if (!enabled || !courseId) {
      setLoading(false);
      setNotFound(false);
      setError(null);
      setCourse(null);
    } else {
      setLoading(true);
      setNotFound(false);
      setError(null);
      setCourse(null);
    }
  }

  const reload = useCallback(() => {
    setRequestId((current) => current + 1);
  }, []);

  useEffect(() => {
    if (!enabled || !courseId || !accessToken) {
      return;
    }

    let active = true;

    getCourseById(courseId, accessToken)
      .then((result) => {
        if (!active) {
          return;
        }
        setCourse(result);
        setNotFound(false);
        setError(null);
      })
      .catch((cause: unknown) => {
        if (!active) {
          return;
        }
        setCourse(null);
        if (cause instanceof ApiError && cause.status === 404) {
          setNotFound(true);
          setError(null);
          return;
        }
        setNotFound(false);
        setError(adminCourseLoadMessage(cause));
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [courseId, accessToken, enabled, requestId]);

  return { course, loading, notFound, error, reload };
}
