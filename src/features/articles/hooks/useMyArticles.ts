import { useCallback, useEffect, useRef, useState } from 'react';
import { ApiError } from '../../../services/api/api-error';
import type { PageResponse } from '../../../types/pagination.types';
import { listMyArticlesPage } from '../api/manage-articles.api';
import type { ManageArticle } from '../types/manage-article.types';

export type MyArticlesOptions = {
  page?: number;
  size?: number;
  sort?: string;
  enabled?: boolean;
};

export function useMyArticles(
  accessToken: string | null,
  options: MyArticlesOptions = {},
) {
  const pageNumber = options.page ?? 0;
  const pageSize = options.size ?? 20;
  const sort = options.sort ?? 'updatedAt,desc';
  const enabled = options.enabled !== false;

  const [page, setPage] = useState<PageResponse<ManageArticle> | null>(null);
  const [loading, setLoading] = useState(enabled && Boolean(accessToken));
  const [error, setError] = useState<string | null>(null);
  const [requestId, setRequestId] = useState(0);
  const fetchGeneration = useRef(0);

  const reload = useCallback(() => {
    setRequestId((value) => value + 1);
  }, []);

  useEffect(() => {
    if (!enabled || !accessToken) {
      setPage(null);
      setLoading(false);
      setError(null);
      return;
    }

    let active = true;
    const generation = ++fetchGeneration.current;
    setLoading(true);
    setError(null);

    listMyArticlesPage(accessToken, { page: pageNumber, size: pageSize, sort })
      .then((result) => {
        if (!active || generation !== fetchGeneration.current) {
          return;
        }
        setPage(result);
      })
      .catch((cause: unknown) => {
        if (!active || generation !== fetchGeneration.current) {
          return;
        }
        setPage(null);
        setError(
          cause instanceof ApiError
            ? 'Không tải được danh sách bài viết. Vui lòng thử lại sau.'
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
  }, [accessToken, enabled, pageNumber, pageSize, sort, requestId]);

  return {
    articles: page?.content ?? null,
    page,
    loading,
    error,
    reload,
  };
}
