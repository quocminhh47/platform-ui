import { useCallback, useEffect, useRef, useState } from 'react';
import { ApiError } from '../../../services/api/api-error';
import { getManageArticle } from '../api/manage-articles.api';
import type { ManageArticle } from '../types/manage-article.types';

export function useManageArticle(accessToken: string | null, articleId: string | undefined) {
  const [article, setArticle] = useState<ManageArticle | null>(null);
  const [loading, setLoading] = useState(Boolean(articleId));
  const [error, setError] = useState<string | null>(null);
  const [requestId, setRequestId] = useState(0);
  const fetchGeneration = useRef(0);

  const reload = useCallback(() => {
    setRequestId((value) => value + 1);
  }, []);

  useEffect(() => {
    if (!articleId || !accessToken) {
      setArticle(null);
      setLoading(false);
      setError(null);
      return;
    }

    let active = true;
    const generation = ++fetchGeneration.current;
    setLoading(true);
    setError(null);

    getManageArticle(accessToken, articleId)
      .then((result) => {
        if (!active || generation !== fetchGeneration.current) {
          return;
        }
        setArticle(result);
      })
      .catch((cause: unknown) => {
        if (!active || generation !== fetchGeneration.current) {
          return;
        }
        setArticle(null);
        setError(
          cause instanceof ApiError && cause.status === 403
            ? 'Bạn không có quyền xem hoặc chỉnh sửa bài viết này.'
            : cause instanceof ApiError && cause.status === 404
              ? 'Không tìm thấy bài viết hoặc bạn không có quyền xem.'
              : 'Không tải được bài viết. Vui lòng thử lại sau.',
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
  }, [accessToken, articleId, requestId]);

  return { article, loading, error, reload, setArticle };
}
