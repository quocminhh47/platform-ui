import { useCallback, useEffect, useRef, useState } from 'react';
import { ApiError } from '../../../services/api/api-error';
import type { PageResponse } from '../../../types/pagination.types';
import { useDebouncedValue } from '../../../hooks/useDebouncedValue';
import { useAuth } from '../../auth/hooks/useAuth';
import { listCoursesPage } from '../api/courses.api';
import type { Course } from '../types/course.types';

export type PublishedCoursesOptions = {
  page?: number;
  size?: number;
  q?: string;
};

export type PublishedCoursesState = {
  courses: Course[] | null;
  page: PageResponse<Course> | null;
  loading: boolean;
  error: string | null;
  reload: () => void;
};

export function usePublishedCourses(
  options: PublishedCoursesOptions = {},
): PublishedCoursesState {
  const { accessToken } = useAuth();
  const pageNumber = options.page ?? 0;
  const pageSize = options.size ?? 20;
  const debouncedQ = useDebouncedValue(options.q ?? '', 300);
  const [page, setPage] = useState<PageResponse<Course> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [requestId, setRequestId] = useState(0);
  const fetchGeneration = useRef(0);

  const reload = useCallback(() => {
    setRequestId((current) => current + 1);
  }, []);

  useEffect(() => {
    let active = true;
    const generation = ++fetchGeneration.current;
    setLoading(true);
    setError(null);

    listCoursesPage(accessToken, {
      published: true,
      page: pageNumber,
      size: pageSize,
      q: debouncedQ.trim() || undefined,
      sort: 'updatedAt,desc',
    })
      .then((result) => {
        if (!active || generation !== fetchGeneration.current) {
          return;
        }
        setPage(result);
        setError(null);
      })
      .catch((cause: unknown) => {
        if (!active || generation !== fetchGeneration.current) {
          return;
        }
        setPage(null);
        setError(
          cause instanceof ApiError
            ? 'Không tải được danh sách khóa học. Vui lòng thử lại sau.'
            : 'Không kết nối được máy chủ. Kiểm tra mạng và thử lại.',
        );
      })
      .finally(() => {
        if (active && generation === fetchGeneration.current) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [accessToken, requestId, pageNumber, pageSize, debouncedQ]);

  return {
    courses: page?.content ?? null,
    page,
    loading,
    error,
    reload,
  };
}
