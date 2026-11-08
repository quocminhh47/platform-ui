import { apiRequest } from '../../../services/api/client';
import { appendPageQuery, type PageResponse } from '../../../types/pagination.types';
import type { ArticleWriteBody, ManageArticle } from '../types/manage-article.types';

export type MyArticlesListParams = {
  page?: number;
  size?: number;
  sort?: string;
};

export function createArticle(
  accessToken: string,
  body: ArticleWriteBody,
): Promise<ManageArticle> {
  return apiRequest<ManageArticle>('/api/articles', {
    method: 'POST',
    accessToken,
    body,
  });
}

export function updateArticle(
  accessToken: string,
  id: string,
  body: ArticleWriteBody,
): Promise<ManageArticle> {
  return apiRequest<ManageArticle>(`/api/articles/${id}`, {
    method: 'PUT',
    accessToken,
    body,
  });
}

export function saveArticleDraft(
  accessToken: string,
  id: string,
  body: Omit<ArticleWriteBody, 'publishImmediately'>,
): Promise<ManageArticle> {
  return apiRequest<ManageArticle>(`/api/articles/${id}/draft`, {
    method: 'PUT',
    accessToken,
    body,
  });
}

export function submitArticle(accessToken: string, id: string): Promise<ManageArticle> {
  return apiRequest<ManageArticle>(`/api/articles/${id}/submit`, {
    method: 'POST',
    accessToken,
  });
}

export function getManageArticle(accessToken: string, id: string): Promise<ManageArticle> {
  return apiRequest<ManageArticle>(`/api/articles/${id}/manage`, { accessToken });
}

/** GET /api/articles/my — current author's articles (paginated). */
export function listMyArticlesPage(
  accessToken: string,
  params: MyArticlesListParams = {},
): Promise<PageResponse<ManageArticle>> {
  const path = appendPageQuery('/api/articles/my', {
    page: params.page ?? 0,
    size: params.size ?? 20,
    sort: params.sort ?? 'updatedAt,desc',
  });
  return apiRequest<PageResponse<ManageArticle>>(path, { accessToken });
}

export function adminPublishArticle(accessToken: string, id: string): Promise<ManageArticle> {
  return apiRequest<ManageArticle>(`/api/admin/articles/${id}/publish`, {
    method: 'POST',
    accessToken,
  });
}
