import { useCallback, useEffect, useRef, useState } from 'react';
import { ApiError } from '../../../services/api/api-error';
import type { PageResponse } from '../../../types/pagination.types';
import { listPublicArticlesPage } from '../api/public-articles.api';
import type { PublicArticleSummary } from '../types/article.types';

export type PublicArticlesPageOptions = {
  page?: number;
  size?: number;
  sort?: string;
};

export type PublicArticlesPageState = {
  page: PageResponse<PublicArticleSummary> | null;
  articles: PublicArticleSummary[] | null;
  loading: boolean;
  error: string | null;
  reload: () => void;
};

export function usePublicArticlesPage(
  options: PublicArticlesPageOptions = {},
): PublicArticlesPageState {
  const pageNumber = options.page ?? 0;
  const pageSize = options.size ?? 20;
  const sort = options.sort ?? 'publishedAt,desc';
  const [page, setPage] = useState<PageResponse<PublicArticleSummary> | null>(null);
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

    listPublicArticlesPage({ page: pageNumber, size: pageSize, sort })
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
  }, [pageNumber, pageSize, sort, requestId]);

  return {
    page,
    articles: page?.content ?? null,
    loading,
    error,
    reload,
  };
}
