import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { RouterProvider, createMemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../../app/providers/AuthProvider';
import { ApiError } from '../../services/api/api-error';
import { setAccessToken } from '../../services/api/token-storage';
import * as authApi from '../auth/api/auth.api';
import { ProtectedRoute } from '../auth/components/ProtectedRoute';
import { LoginPage } from '../auth/pages/LoginPage';
import type { User } from '../auth/types/auth.types';
import * as coursesApi from '../catalog/api/courses.api';
import { DashboardPage } from './pages/DashboardPage';
import type { Course } from '../catalog/types/course.types';

vi.mock('../auth/api/auth.api', () => ({
  fetchCurrentUser: vi.fn(),
  login: vi.fn(),
  register: vi.fn(),
}));

vi.mock('../catalog/api/courses.api', () => ({
  listPublishedCourses: vi.fn(),
}));

const auth = vi.mocked(authApi);
const courses = vi.mocked(coursesApi);

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

function course(title: string): Course {
  return {
    id: title,
    title,
    description: 'A published course',
    instructorId: 'instructor-1',
    price: 0,
    published: true,
    finalQuizId: null,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  };
}

function renderDashboard(path = '/dashboard') {
  const router = createMemoryRouter(
    [
      {
        element: <ProtectedRoute />,
        children: [{ path: '/dashboard', element: <DashboardPage /> }],
      },
      { path: '/login', element: <LoginPage /> },
    ],
    { initialEntries: [path] },
  );
  render(
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>,
  );
  return router;
}

beforeEach(() => {
  sessionStorage.clear();
  auth.fetchCurrentUser.mockReset();
  auth.login.mockReset();
  auth.register.mockReset();
  courses.listPublishedCourses.mockReset();
  courses.listPublishedCourses.mockResolvedValue([]);
});

describe('student dashboard', () => {
  it('sends unauthenticated visitors to login and keeps the destination', async () => {
    const router = renderDashboard();

    expect(await screen.findByRole('heading', { name: 'Sign in' })).toBeTruthy();
    expect(router.state.location.pathname).toBe('/login');
    expect(router.state.location.state).toEqual({ from: '/dashboard' });
  });

  it('shows the signed-in name and published courses', async () => {
    setAccessToken('token');
    auth.fetchCurrentUser.mockResolvedValue(student);
    courses.listPublishedCourses.mockResolvedValue([course('Intro to Algebra')]);

    renderDashboard();

    expect(await screen.findByRole('heading', { name: 'Welcome back, Minh Student' })).toBeTruthy();
    expect(await screen.findByRole('heading', { name: 'Intro to Algebra' })).toBeTruthy();
    expect(screen.getByText('Miễn phí')).toBeTruthy();
    expect(courses.listPublishedCourses).toHaveBeenCalledWith('token');
    const exploreLinks = screen.getAllByRole('link', { name: 'Explore courses' });
    expect(exploreLinks.length).toBeGreaterThan(0);
    for (const link of exploreLinks) {
      expect(link.getAttribute('href')).toBe('/courses');
    }
    expect(screen.getAllByText('Not available').length).toBe(3);
  });

  it('keeps the dashboard usable when the course catalog fails', async () => {
    setAccessToken('token');
    auth.fetchCurrentUser.mockResolvedValue(student);
    courses.listPublishedCourses.mockRejectedValue(new ApiError(500, 'database exploded'));

    renderDashboard();

    expect(await screen.findByRole('heading', { name: 'Welcome back, Minh Student' })).toBeTruthy();
    const alert = await screen.findByRole('alert');
    expect(alert.textContent).not.toMatch(/database/);
    expect(screen.getByText('Nothing to continue yet')).toBeTruthy();
  });

  it('shows an empty catalog without inventing courses', async () => {
    setAccessToken('token');
    auth.fetchCurrentUser.mockResolvedValue(student);
    courses.listPublishedCourses.mockResolvedValue([]);

    renderDashboard();

    expect(await screen.findByText('No published courses')).toBeTruthy();
  });

  it('logs out through the existing session flow', async () => {
    setAccessToken('token');
    auth.fetchCurrentUser.mockResolvedValue(student);

    const router = renderDashboard();
    await screen.findByRole('heading', { name: 'Welcome back, Minh Student' });
    fireEvent.click(screen.getByRole('button', { name: 'Log out' }));

    await waitFor(() => expect(router.state.location.pathname).toBe('/login'));
    expect(sessionStorage.getItem('lms.accessToken')).toBeNull();
  });
});
