import { apiRequest } from '../../../services/api/client';
import { appendPageQuery, type PageResponse } from '../../../types/pagination.types';
import type { PublicArticleDetail, PublicArticleSummary } from '../types/article.types';

export type PublicArticleListParams = {
  page?: number;
  size?: number;
  sort?: string;
};

/** GET /api/public/articles — published snapshot list (no auth). */
export function listPublicArticlesPage(
  params: PublicArticleListParams = {},
): Promise<PageResponse<PublicArticleSummary>> {
  const path = appendPageQuery('/api/public/articles', {
    page: params.page ?? 0,
    size: params.size ?? 20,
    sort: params.sort ?? 'publishedAt,desc',
  });
  return apiRequest<PageResponse<PublicArticleSummary>>(path);
}

/** GET /api/public/articles/{slug} — published snapshot detail (no auth). */
export function getPublicArticleBySlug(slug: string): Promise<PublicArticleDetail> {
  return apiRequest<PublicArticleDetail>(`/api/public/articles/${encodeURIComponent(slug)}`);
}
