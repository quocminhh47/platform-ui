import { render, screen, waitFor } from '@testing-library/react';
import { RouterProvider, createMemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../../app/providers/AuthProvider';
import { ToastProvider } from '../../components/feedback/ToastProvider';
import { setAccessToken } from '../../services/api/token-storage';
import * as authApi from '../auth/api/auth.api';
import { ProtectedRoute } from '../auth/components/ProtectedRoute';
import { LoginPage } from '../auth/pages/LoginPage';
import type { User } from '../auth/types/auth.types';
import { AdminRoute } from './components/AdminRoute';
import { AdminCourseListPage } from './pages/AdminCourseListPage';

vi.mock('../auth/api/auth.api', () => ({
  fetchCurrentUser: vi.fn(),
  login: vi.fn(),
  register: vi.fn(),
}));

vi.mock('./api/admin-courses.api', () => ({
  listAllCourses: vi.fn().mockResolvedValue([]),
  publishCourse: vi.fn(),
  unpublishCourse: vi.fn(),
}));

const auth = vi.mocked(authApi);

const student: User = {
  id: 'u-student',
  email: 'student@example.com',
  fullName: 'Minh Student',
  role: 'STUDENT',
  avatarUrl: null,
  active: true,
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
};

const admin: User = {
  ...student,
  id: 'u-admin',
  email: 'admin@example.com',
  fullName: 'Admin User',
  role: 'ADMIN',
};

function renderAdminRoute(initialPath = '/admin/courses') {
  const router = createMemoryRouter(
    [
      {
        element: <ProtectedRoute />,
        children: [
          { path: '/dashboard', element: <p>Dashboard page</p> },
          {
            element: <AdminRoute />,
            children: [{ path: '/admin/courses', element: <AdminCourseListPage /> }],
          },
        ],
      },
      { path: '/login', element: <LoginPage /> },
    ],
    { initialEntries: [initialPath] },
  );

  render(
    <AuthProvider>
      <ToastProvider>
        <RouterProvider router={router} />
      </ToastProvider>
    </AuthProvider>,
  );

  return router;
}

beforeEach(() => {
  sessionStorage.clear();
  auth.fetchCurrentUser.mockReset();
});

describe('AdminRoute', () => {
  it('redirects unauthenticated visitors to login with return path', async () => {
    const router = renderAdminRoute();

    expect(await screen.findByRole('heading', { name: 'Sign in' })).toBeTruthy();
    expect(router.state.location.pathname).toBe('/login');
    expect(router.state.location.state).toEqual({ from: '/admin/courses' });
  });

  it('redirects authenticated non-admin users to the dashboard', async () => {
    setAccessToken('token');
    auth.fetchCurrentUser.mockResolvedValue(student);

    const router = renderAdminRoute();

    expect(await screen.findByText('Dashboard page')).toBeTruthy();
    await waitFor(() => expect(router.state.location.pathname).toBe('/dashboard'));
  });

  it('allows ADMIN users to reach the admin course list', async () => {
    setAccessToken('token');
    auth.fetchCurrentUser.mockResolvedValue(admin);

    renderAdminRoute();

    expect(await screen.findByRole('heading', { name: 'Quản lý khóa học' })).toBeTruthy();
  });
});
