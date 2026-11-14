import { useCallback, useEffect, useRef, useState } from 'react';
import { ApiError } from '../../../services/api/api-error';
import { listAllMyArticles } from '../api/manage-articles.api';
import type { ManageArticle } from '../types/manage-article.types';

export type MyArticlesOptions = {
  sort?: string;
  enabled?: boolean;
};

export function useMyArticles(
  accessToken: string | null,
  options: MyArticlesOptions = {},
) {
  const sort = options.sort ?? 'updatedAt,desc';
  const enabled = options.enabled !== false;

  const [articles, setArticles] = useState<ManageArticle[] | null>(null);
  const [loading, setLoading] = useState(enabled && Boolean(accessToken));
  const [error, setError] = useState<string | null>(null);
  const [requestId, setRequestId] = useState(0);
  const fetchGeneration = useRef(0);

  const reload = useCallback(() => {
    setRequestId((value) => value + 1);
  }, []);

  useEffect(() => {
    if (!enabled || !accessToken) {
      setArticles(null);
      setLoading(false);
      setError(null);
      return;
    }

    let active = true;
    const generation = ++fetchGeneration.current;
    setLoading(true);
    setError(null);

    listAllMyArticles(accessToken, { sort })
      .then((result) => {
        if (!active || generation !== fetchGeneration.current) {
          return;
        }
        setArticles(result);
      })
      .catch((cause: unknown) => {
        if (!active || generation !== fetchGeneration.current) {
          return;
        }
        setArticles(null);
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
  }, [accessToken, enabled, sort, requestId]);

  return {
    articles,
    loading,
    error,
    reload,
  };
}
