import { render, screen } from '@testing-library/react';
import { RouterProvider, createMemoryRouter } from 'react-router-dom';
import { AppShell } from '../../components/layout/AppShell';
import { AuthProvider } from '../../app/providers/AuthProvider';
import { setAccessToken } from '../../services/api/token-storage';
import * as authApi from '../auth/api/auth.api';
import * as coursesApi from './api/courses.api';
import type { User } from '../auth/types/auth.types';
import { CatalogPage } from './pages/CatalogPage';
import { mockPage } from '../../testing/mockPageResponse';

vi.mock('../auth/api/auth.api', () => ({
  fetchCurrentUser: vi.fn(),
  login: vi.fn(),
  register: vi.fn(),
}));

vi.mock('./api/courses.api', () => ({
  listCoursesPage: vi.fn(),
}));

const auth = vi.mocked(authApi);
const courses = vi.mocked(coursesApi);

const admin: User = {
  id: 'admin',
  email: 'admin@example.com',
  fullName: 'Admin User',
  role: 'ADMIN',
  avatarUrl: null,
  active: true,
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
};

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

function renderCatalog(asUser: User) {
  setAccessToken('token');
  auth.fetchCurrentUser.mockResolvedValue(asUser);
  courses.listCoursesPage.mockResolvedValue(mockPage([]));

  const router = createMemoryRouter(
    [
      {
        path: '/',
        element: <AppShell />,
        children: [{ path: 'courses', element: <CatalogPage /> }],
      },
    ],
    { initialEntries: ['/courses'] },
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
  courses.listCoursesPage.mockReset();
});

describe('catalog admin layout', () => {
  it('shows admin workspace sidebar for ADMIN on course discovery', async () => {
    renderCatalog(admin);

    expect(await screen.findByRole('heading', { name: 'Danh mục khóa học' })).toBeTruthy();
    expect(screen.getByRole('navigation', { name: 'Quản trị' })).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Khám phá khóa học' })).toBeTruthy();
  });

  it('does not show admin workspace sidebar for students', async () => {
    renderCatalog(student);

    expect(await screen.findByRole('heading', { name: 'Danh mục khóa học' })).toBeTruthy();
    expect(screen.queryByRole('navigation', { name: 'Quản trị' })).toBeNull();
  });
});
