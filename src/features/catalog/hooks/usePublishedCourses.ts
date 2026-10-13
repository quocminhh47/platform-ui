import { useCallback, useEffect, useState } from 'react';
import { ApiError } from '../../../services/api/api-error';
import { useAuth } from '../../auth/hooks/useAuth';
import { listPublishedCourses } from '../api/courses.api';
import type { Course } from '../types/course.types';

export type PublishedCoursesState = {
  courses: Course[] | null;
  loading: boolean;
  error: string | null;
  reload: () => void;
};

export function usePublishedCourses(): PublishedCoursesState {
  const { accessToken } = useAuth();
  const [courses, setCourses] = useState<Course[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [requestId, setRequestId] = useState(0);
  const [query, setQuery] = useState({ accessToken, requestId });

  if (query.accessToken !== accessToken || query.requestId !== requestId) {
    setQuery({ accessToken, requestId });
    setLoading(true);
    setError(null);
  }

  const reload = useCallback(() => {
    setRequestId((current) => current + 1);
  }, []);

  useEffect(() => {
    let active = true;

    listPublishedCourses(accessToken)
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
        setError(
          cause instanceof ApiError
            ? 'Courses could not be loaded. Try again in a moment.'
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
  }, [accessToken, requestId]);

  return { courses, loading, error, reload };
}
