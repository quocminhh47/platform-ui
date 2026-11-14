import { render, screen } from '@testing-library/react';
import { RouterProvider, createMemoryRouter } from 'react-router-dom';
import { AppShell } from '../../components/layout/AppShell';
import { AuthProvider } from '../../app/providers/AuthProvider';
import { setAccessToken } from '../../services/api/token-storage';
import * as authApi from '../auth/api/auth.api';
import * as articlesApi from './api/public-articles.api';
import type { User } from '../auth/types/auth.types';
import { ArticleListPage } from './pages/ArticleListPage';
import { mockPage } from '../../testing/mockPageResponse';

vi.mock('../auth/api/auth.api', () => ({
  fetchCurrentUser: vi.fn(),
  login: vi.fn(),
  register: vi.fn(),
}));

vi.mock('./api/public-articles.api', () => ({
  listPublicArticlesPage: vi.fn(),
}));

const auth = vi.mocked(authApi);
const articles = vi.mocked(articlesApi);

const student: User = {
  id: 'u1',
  email: 'student@example.com',
  fullName: 'Minh Student',
  role: 'STUDENT',
  avatarUrl: null,
  active: true,
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
};

function renderArticles(asUser?: User) {
  if (asUser) {
    setAccessToken('token');
    auth.fetchCurrentUser.mockResolvedValue(asUser);
  }
  articles.listPublicArticlesPage.mockResolvedValue(mockPage([]));

  const router = createMemoryRouter(
    [
      {
        path: '/',
        element: <AppShell />,
        children: [{ path: 'articles', element: <ArticleListPage /> }],
      },
    ],
    { initialEntries: ['/articles'] },
  );

  return render(
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>,
  );
}

beforeEach(() => {
  sessionStorage.clear();
  auth.fetchCurrentUser.mockReset();
  articles.listPublicArticlesPage.mockReset();
});

describe('articles member layout', () => {
  it('shows member sidebar for signed-in users on /articles', async () => {
    renderArticles(student);

    expect(await screen.findByRole('heading', { name: 'Bài viết' })).toBeTruthy();
    expect(screen.getByRole('navigation', { name: 'Bảng điều khiển' })).toBeTruthy();
    const articleNavLinks = screen
      .getAllByRole('link', { name: 'Bài viết', hidden: true })
      .filter((node) => node.getAttribute('href') === '/articles');
    expect(articleNavLinks.length).toBeGreaterThan(0);
    expect(screen.getAllByRole('link', { name: 'Tạo bài viết' })[0].getAttribute('href')).toBe(
      '/articles/create',
    );
  });

  it('does not show member sidebar for guests', async () => {
    renderArticles();

    expect(await screen.findByRole('heading', { name: 'Bài viết' })).toBeTruthy();
    expect(screen.queryByRole('navigation', { name: 'Bảng điều khiển' })).toBeNull();
  });
});
