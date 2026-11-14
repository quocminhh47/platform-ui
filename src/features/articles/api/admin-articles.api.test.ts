import { listAdminArticles, moderateArticle, adminPublishArticle } from './admin-articles.api';
import { apiRequest } from '../../../services/api/client';
vi.mock('../../../services/api/client', () => ({ apiRequest: vi.fn() }));
beforeEach(() => vi.clearAllMocks());
it('requests server pagination and status filters', async () => {
  await listAdminArticles('token', 2, 'REJECTED');
  expect(apiRequest).toHaveBeenCalledWith('/api/admin/articles?page=2&size=20&status=REJECTED', { accessToken: 'token' });
  await listAdminArticles('token', 0);
  expect(apiRequest).toHaveBeenLastCalledWith('/api/admin/articles?page=0&size=20', { accessToken: 'token' });
});
it('uses the pending queue endpoint', async () => {
  await listAdminArticles('token', 1, 'PENDING_REVIEW');
  expect(apiRequest).toHaveBeenCalledWith('/api/admin/articles/pending?page=1&size=20', { accessToken: 'token' });
});
it.each(['approve', 'archive'] as const)('posts %s', async action => {
  await moderateArticle('token', 'id', action);
  expect(apiRequest).toHaveBeenCalledWith(`/api/admin/articles/id/${action}`, { method: 'POST', accessToken: 'token' });
});
it('posts the rejection reason', async () => {
  await moderateArticle('token', 'id', 'reject', 'Needs sources');
  expect(apiRequest).toHaveBeenCalledWith('/api/admin/articles/id/reject', { method: 'POST', accessToken: 'token', body: { reason: 'Needs sources' } });
});
it('reuses direct publishing', async () => {
  await adminPublishArticle('token', 'id');
  expect(apiRequest).toHaveBeenCalledWith('/api/admin/articles/id/publish', { method: 'POST', accessToken: 'token' });
});
