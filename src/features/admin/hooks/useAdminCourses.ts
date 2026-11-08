import { useCallback, useEffect, useRef, useState } from 'react';
import type { PageResponse } from '../../../types/pagination.types';
import { useDebouncedValue } from '../../../hooks/useDebouncedValue';
import { useAuth } from '../../auth/hooks/useAuth';
import type { Course } from '../../catalog/types/course.types';
import { listAdminCoursesPage } from '../api/admin-courses.api';
import type { CourseListParams } from '../../catalog/api/courses.api';
import { adminCoursesLoadMessage } from '../utils/admin-messages';
import {
  adminCourseSortToApi,
  adminCourseStatusToPublished,
} from '../utils/adminListQueryMappers';
import type { AdminCourseSort, AdminCourseStatusFilter } from '../utils/adminCourseListFilters';

export type AdminCoursesQuery = {
  q: string;
  status: AdminCourseStatusFilter;
  sort: AdminCourseSort;
  page: number;
  size: number;
};

export type AdminCoursesState = {
  page: PageResponse<Course> | null;
  loading: boolean;
  error: string | null;
  reload: () => void;
  refresh: () => Promise<PageResponse<Course> | null>;
};

const DEFAULT_QUERY: AdminCoursesQuery = {
  q: '',
  status: 'all',
  sort: 'newest',
  page: 0,
  size: 20,
};

export function useAdminCourses(
  enabled: boolean,
  query: AdminCoursesQuery = DEFAULT_QUERY,
): AdminCoursesState {
  const { accessToken } = useAuth();
  const debouncedQ = useDebouncedValue(query.q, 300);
  const [page, setPage] = useState<PageResponse<Course> | null>(null);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);
  const [requestId, setRequestId] = useState(0);
  const fetchGeneration = useRef(0);

  const reload = useCallback(() => {
    setRequestId((current) => current + 1);
  }, []);

  const apiParams: CourseListParams = {
    q: debouncedQ.trim() || undefined,
    published: adminCourseStatusToPublished(query.status),
    sort: adminCourseSortToApi(query.sort),
    page: query.page,
    size: query.size,
  };

  const refresh = useCallback(async () => {
    if (!accessToken) {
      setPage(null);
      return null;
    }
    const result = await listAdminCoursesPage(accessToken, apiParams);
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

    listAdminCoursesPage(accessToken, apiParams)
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
        setError(adminCoursesLoadMessage(cause));
      })
      .finally(() => {
        if (generation === fetchGeneration.current) {
          setLoading(false);
        }
      });
  }, [enabled, accessToken, requestId, debouncedQ, query.status, query.sort, query.page, query.size]);

  return { page, loading, error, reload, refresh };
}
