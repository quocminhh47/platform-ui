import { useCallback, useEffect, useState } from 'react';
import { ApiError } from '../../../services/api/api-error';
import { useAuth } from '../../auth/hooks/useAuth';
import { getCourseById } from '../api/courses.api';
import type { Course } from '../types/course.types';

export type CourseDetailState = {
  course: Course | null;
  loading: boolean;
  notFound: boolean;
  error: string | null;
  reload: () => void;
};

export function useCourseDetail(courseId: string | undefined): CourseDetailState {
  const { accessToken } = useAuth();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(Boolean(courseId));
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [requestId, setRequestId] = useState(0);
  const [query, setQuery] = useState({ courseId, accessToken, requestId });

  if (
    query.courseId !== courseId ||
    query.accessToken !== accessToken ||
    query.requestId !== requestId
  ) {
    setQuery({ courseId, accessToken, requestId });
    if (!courseId) {
      setLoading(false);
      setNotFound(true);
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
    if (!courseId) {
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
        setError(
          cause instanceof ApiError
            ? 'This course could not be loaded. Try again in a moment.'
            : 'Unable to reach the server. Check your connection and try again.',
        );
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [courseId, accessToken, requestId]);

  return { course, loading, notFound, error, reload };
}
