import { beforeEach, describe, expect, it, vi } from 'vitest';
import { apiRequest } from '../../../services/api/client';
import { getPublicArticleBySlug, listPublicArticlesPage } from './public-articles.api';

vi.mock('../../../services/api/client', () => ({
  apiRequest: vi.fn(),
}));

describe('public-articles.api', () => {
  beforeEach(() => {
    vi.mocked(apiRequest).mockReset();
  });

  it('lists public articles with default pagination and sort', async () => {
    vi.mocked(apiRequest).mockResolvedValue({ content: [], page: 0, size: 20, totalElements: 0, totalPages: 0, first: true, last: true });
    await listPublicArticlesPage();
    expect(apiRequest).toHaveBeenCalledWith('/api/public/articles?page=0&size=20&sort=publishedAt%2Cdesc');
  });

  it('gets article by slug', async () => {
    vi.mocked(apiRequest).mockResolvedValue({ slug: 'hello-world' });
    await getPublicArticleBySlug('hello-world');
    expect(apiRequest).toHaveBeenCalledWith('/api/public/articles/hello-world');
  });
});
