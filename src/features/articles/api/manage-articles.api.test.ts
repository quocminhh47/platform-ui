import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  createArticle,
  listMyArticlesPage,
  saveArticleDraft,
  submitArticle,
  updateArticle,
} from './manage-articles.api';

const apiRequest = vi.fn();

vi.mock('../../../services/api/client', () => ({
  apiRequest: (...args: unknown[]) => apiRequest(...args),
}));

const token = 'jwt-token';
const body = {
  title: 'T',
  contentHtml: '<p>Body</p>',
};

describe('manage-articles.api', () => {
  beforeEach(() => {
    apiRequest.mockReset();
    apiRequest.mockResolvedValue({ id: 'a1' });
  });

  it('creates article', async () => {
    await createArticle(token, body);
    expect(apiRequest).toHaveBeenCalledWith('/api/articles', {
      method: 'POST',
      accessToken: token,
      body,
    });
  });

  it('saves draft', async () => {
    await saveArticleDraft(token, 'id-1', body);
    expect(apiRequest).toHaveBeenCalledWith('/api/articles/id-1/draft', {
      method: 'PUT',
      accessToken: token,
      body,
    });
  });

  it('submits article', async () => {
    await submitArticle(token, 'id-1');
    expect(apiRequest).toHaveBeenCalledWith('/api/articles/id-1/submit', {
      method: 'POST',
      accessToken: token,
    });
  });

  it('lists my articles', async () => {
    await listMyArticlesPage(token, { page: 1, size: 10 });
    expect(apiRequest).toHaveBeenCalledWith(
      '/api/articles/my?page=1&size=10&sort=updatedAt%2Cdesc',
      { accessToken: token },
    );
  });

  it('updates with publish flag', async () => {
    await updateArticle(token, 'id-1', { ...body, publishImmediately: true });
    expect(apiRequest).toHaveBeenCalledWith('/api/articles/id-1', {
      method: 'PUT',
      accessToken: token,
      body: { ...body, publishImmediately: true },
    });
  });
});
