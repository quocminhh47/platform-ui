import { apiRequest } from '../../../services/api/client';
import { appendPageQuery, type PageResponse } from '../../../types/pagination.types';
import type { ArticleStatus, ManageArticle } from '../types/manage-article.types';
export { adminPublishArticle } from './manage-articles.api';

export function listAdminArticles(accessToken: string, page: number, status?: ArticleStatus) {
  const pending = status === 'PENDING_REVIEW';
  return apiRequest<PageResponse<ManageArticle>>(appendPageQuery(
    pending ? '/api/admin/articles/pending' : '/api/admin/articles',
    { page, size: 20, status: pending ? undefined : status },
  ), { accessToken });
}

export function moderateArticle(accessToken: string, id: string, action: 'approve' | 'reject' | 'archive', reason?: string) {
  return apiRequest<ManageArticle>(`/api/admin/articles/${id}/${action}`, {
    method: 'POST', accessToken, ...(action === 'reject' ? { body: { reason } } : {}),
  });
}
