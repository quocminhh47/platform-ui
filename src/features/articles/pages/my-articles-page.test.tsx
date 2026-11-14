import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../../../app/providers/AuthProvider';
import { ToastProvider } from '../../../components/feedback/ToastProvider';
import * as authApi from '../../auth/api/auth.api';
import { setAccessToken } from '../../../services/api/token-storage';
import type { User } from '../../auth/types/auth.types';
import * as manageApi from '../api/manage-articles.api';
import { MyArticlesPage } from './MyArticlesPage';
import type { ManageArticle } from '../types/manage-article.types';

vi.mock('../../auth/api/auth.api', () => ({
  fetchCurrentUser: vi.fn(),
  login: vi.fn(),
  register: vi.fn(),
}));

vi.mock('../api/manage-articles.api');

const auth = vi.mocked(authApi);
const manage = vi.mocked(manageApi);

const student: User = {
  id: 'u1',
  email: 's@example.com',
  fullName: 'Student',
  firstName: null,
  lastName: null,
  phone: null,
  dateOfBirth: null,
  role: 'STUDENT',
  avatarUrl: null,
  active: true,
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
};

function article(partial: Partial<ManageArticle> & Pick<ManageArticle, 'id' | 'status' | 'title'>): ManageArticle {
  return {
    slug: 'post',
    authorId: 'u1',
    authorName: 'Student',
    excerpt: null,
    featuredImageUrl: null,
    contentHtml: '<p>Body</p>',
    publishedTitle: null,
    publishedExcerpt: null,
    publishedFeaturedImageUrl: null,
    publishedContentHtml: null,
    rejectionReason: null,
    submittedAt: null,
    reviewedById: null,
    reviewedByName: null,
    reviewedAt: null,
    publishedAt: null,
    archivedAt: null,
    createdAt: '2026-01-02T00:00:00Z',
    updatedAt: '2026-01-02T00:00:00Z',
    ...partial,
  };
}

function renderPage() {
  return render(
    <AuthProvider>
      <ToastProvider>
        <MemoryRouter>
          <MyArticlesPage />
        </MemoryRouter>
      </ToastProvider>
    </AuthProvider>,
  );
}

beforeEach(() => {
  setAccessToken('token');
  auth.fetchCurrentUser.mockResolvedValue(student);
  manage.listAllMyArticles.mockReset();
  manage.submitArticle.mockReset();
});

describe('MyArticlesPage', () => {
  it('lists articles with status badge', async () => {
    manage.listAllMyArticles.mockResolvedValue(
      [article({ id: 'a1', title: 'Draft post', status: 'DRAFT' })],
    );

    renderPage();

    expect(await screen.findByRole('heading', { name: 'Bài viết của tôi' })).toBeTruthy();
    expect(await screen.findByText('Draft post')).toBeTruthy();
    expect(screen.getAllByText('Bản nháp').length).toBeGreaterThan(0);
  });

  it('shows rejection reason for rejected articles', async () => {
    manage.listAllMyArticles.mockResolvedValue(
      [
        article({
          id: 'a2',
          title: 'Needs work',
          status: 'REJECTED',
          rejectionReason: 'Thiếu nguồn',
        }),
      ],
    );

    renderPage();

    expect(await screen.findByText(/Lý do từ chối: Thiếu nguồn/)).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Gửi duyệt lại' })).toBeTruthy();
  });

  it('submits draft after confirmation', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    manage.listAllMyArticles.mockResolvedValue(
      [article({ id: 'a3', title: 'Ready', status: 'DRAFT' })],
    );
    manage.submitArticle.mockResolvedValue(
      article({ id: 'a3', title: 'Ready', status: 'PENDING_REVIEW' }),
    );

    renderPage();
    await screen.findByRole('button', { name: 'Gửi duyệt' });
    fireEvent.click(screen.getByRole('button', { name: 'Gửi duyệt' }));

    await waitFor(() => {
      expect(manage.submitArticle).toHaveBeenCalledWith('token', 'a3');
    });
  });

  it('shows error state', async () => {
    manage.listAllMyArticles.mockRejectedValue(new Error('fail'));

    renderPage();

    expect(await screen.findByRole('alert')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Thử lại' })).toBeTruthy();
  });
});
