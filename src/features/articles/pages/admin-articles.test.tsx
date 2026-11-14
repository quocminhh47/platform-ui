import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AdminArticlesPage } from './AdminArticlesPage';
import { AdminArticleReviewPage } from './AdminArticleReviewPage';
import { AdminArticleActions } from '../components/AdminArticleActions';
import * as api from '../api/admin-articles.api';
import { useAuth } from '../../auth/hooks/useAuth';
import { useManageArticle } from '../hooks/useManageArticle';
import { mockPage } from '../../../testing/mockPageResponse';
import type { ManageArticle } from '../types/manage-article.types';

vi.mock('../api/admin-articles.api');
vi.mock('../../auth/hooks/useAuth');
vi.mock('../hooks/useManageArticle');
vi.mock('../../../components/feedback/useToast', () => ({ useToast: () => ({ success: vi.fn(), error: vi.fn() }) }));
vi.mock('../../dashboard/components/DashboardSidebar', () => ({ DashboardSidebar: () => <aside>Sidebar</aside> }));
const article = {
  id: 'a1', title: 'Proposed title', status: 'PENDING_REVIEW', authorName: 'Author',
  contentHtml: '<p>Proposed body</p>', publishedTitle: 'Public title', publishedContentHtml: '<p>Public body</p>',
  createdAt: '2026-01-01', updatedAt: '2026-01-02', publishedAt: '2026-01-01',
} as ManageArticle;
const authState = { user: { role: 'ADMIN' }, accessToken: 'token' } as ReturnType<typeof useAuth>;
function mount(element: React.ReactNode) { return render(<MemoryRouter>{element}</MemoryRouter>); }
beforeEach(() => {
  vi.resetAllMocks();
  vi.mocked(useAuth).mockReturnValue(authState);
  vi.mocked(api.listAdminArticles).mockResolvedValue(mockPage([article]));
  HTMLDialogElement.prototype.showModal = function () { this.setAttribute('open', ''); };
  HTMLDialogElement.prototype.close = function () { this.removeAttribute('open'); };
});
it.each(['STUDENT', 'INSTRUCTOR'])('does not request or render admin articles for %s', role => {
  vi.mocked(useAuth).mockReturnValue({ ...authState, user: { role } } as ReturnType<typeof useAuth>);
  mount(<AdminArticlesPage />);
  expect(api.listAdminArticles).not.toHaveBeenCalled();
  expect(screen.queryByText('Quản lý bài viết')).toBeNull();
});
it('filters on the server, including the pending queue, and changes pages', async () => {
  vi.mocked(api.listAdminArticles).mockResolvedValue({ ...mockPage([article]), totalPages: 2, totalElements: 21, last: false });
  mount(<AdminArticlesPage />);
  await screen.findByText('Proposed title');
  fireEvent.click(screen.getByRole('button', { name: 'Trang sau' }));
  await waitFor(() => expect(api.listAdminArticles).toHaveBeenLastCalledWith('token', 1, undefined));
  for (const status of ['PENDING_REVIEW', 'DRAFT', 'PUBLISHED', 'REJECTED', 'ARCHIVED', 'ALL']) {
    fireEvent.change(screen.getByRole('combobox'), { target: { value: status } });
    await waitFor(() => expect(api.listAdminArticles).toHaveBeenLastCalledWith('token', 0, status === 'ALL' ? undefined : status));
  }
});
it('renders working content and the public snapshot without mutation', () => {
  const original = structuredClone(article);
  vi.mocked(useManageArticle).mockReturnValue({ article, loading: false, error: null, reload: vi.fn(), setArticle: vi.fn() });
  mount(<AdminArticleReviewPage />);
  expect(screen.getByText('Proposed body')).toBeTruthy();
  expect(screen.getByText('Public body')).toBeTruthy();
  expect(article).toEqual(original);
  expect(api.moderateArticle).not.toHaveBeenCalled();
});
it.each([
  ['PENDING_REVIEW', 'Phê duyệt', 'approve'],
  ['DRAFT', 'Xuất bản', 'publish'],
  ['REJECTED', 'Xuất bản', 'publish'],
  ['PUBLISHED', 'Lưu trữ', 'archive'],
] as const)('confirms %s %s and prevents duplicate requests', async (status, label, action) => {
  let resolve!: (value: ManageArticle) => void;
  const pending = new Promise<ManageArticle>(done => { resolve = done; });
  vi.mocked(api.moderateArticle).mockReturnValue(pending);
  vi.mocked(api.adminPublishArticle).mockReturnValue(pending);
  const updated = vi.fn();
  mount(<AdminArticleActions article={{ ...article, status }} accessToken="token" onUpdated={updated} />);
  fireEvent.click(screen.getByRole('button', { name: label }));
  expect(api.moderateArticle).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole('button', { name: 'Xác nhận' }));
  fireEvent.submit(screen.getByRole('button', { name: 'Đang xử lý…' }).closest('form')!);
  const request = action === 'publish' ? api.adminPublishArticle : api.moderateArticle;
  expect(request).toHaveBeenCalledTimes(1);
  resolve({ ...article, status: action === 'archive' ? 'ARCHIVED' : 'PUBLISHED' });
  await waitFor(() => expect(updated).toHaveBeenCalledOnce());
});
it('requires a nonblank reason, enforces the limit, and submits trimmed reason', async () => {
  vi.mocked(api.moderateArticle).mockResolvedValue({ ...article, status: 'REJECTED', rejectionReason: 'Missing sources' });
  mount(<AdminArticleActions article={article} accessToken="token" onUpdated={vi.fn()} />);
  fireEvent.click(screen.getByRole('button', { name: 'Từ chối' }));
  const input = screen.getByRole('textbox');
  expect(input.getAttribute('maxlength')).toBe('2000');
  for (const reason of ['   ', 'x'.repeat(2001)]) {
    fireEvent.change(input, { target: { value: reason } });
    fireEvent.click(screen.getByRole('button', { name: 'Xác nhận' }));
    expect(screen.getByRole('alert')).toBeTruthy();
    expect(api.moderateArticle).not.toHaveBeenCalled();
  }
  fireEvent.change(input, { target: { value: ' Missing sources ' } });
  fireEvent.click(screen.getByRole('button', { name: 'Xác nhận' }));
  await waitFor(() => expect(api.moderateArticle).toHaveBeenCalledWith('token', 'a1', 'reject', 'Missing sources'));
});
it('shows no moderation actions for archived articles', () => {
  mount(<AdminArticleActions article={{ ...article, status: 'ARCHIVED' }} accessToken="token" onUpdated={vi.fn()} />);
  expect(screen.queryByRole('button')).toBeNull();
});
