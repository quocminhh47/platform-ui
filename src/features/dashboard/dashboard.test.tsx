import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { RouterProvider, createMemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../../app/providers/AuthProvider';
import { ToastProvider } from '../../components/feedback/ToastProvider';
import { ApiError } from '../../services/api/api-error';
import { setAccessToken } from '../../services/api/token-storage';
import * as authApi from '../auth/api/auth.api';
import { ProtectedRoute } from '../auth/components/ProtectedRoute';
import { LoginPage } from '../auth/pages/LoginPage';
import type { User } from '../auth/types/auth.types';
import * as coursesApi from '../catalog/api/courses.api';
import * as enrollmentsApi from '../enrollment/api/enrollments.api';
import { DashboardPage } from './pages/DashboardPage';
import type { Course } from '../catalog/types/course.types';
import { mockPage } from '../../testing/mockPageResponse';

vi.mock('../auth/api/auth.api', () => ({
  fetchCurrentUser: vi.fn(),
  login: vi.fn(),
  register: vi.fn(),
}));

vi.mock('../catalog/api/courses.api', () => ({
  listCoursesPage: vi.fn(),
}));

vi.mock('../enrollment/api/enrollments.api', () => ({
  listMyEnrollments: vi.fn(),
  enrollInCourse: vi.fn(),
}));

const auth = vi.mocked(authApi);
const courses = vi.mocked(coursesApi);
const enrollments = vi.mocked(enrollmentsApi);

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
  auth.login.mockReset();
  auth.register.mockReset();
  courses.listCoursesPage.mockReset();
  courses.listCoursesPage.mockResolvedValue(mockPage([]));
  enrollments.listMyEnrollments.mockReset();
  enrollments.listMyEnrollments.mockResolvedValue([]);
});

describe('student dashboard', () => {
  it('sends unauthenticated visitors to login and keeps the destination', async () => {
    const router = renderDashboard();

    expect(await screen.findByRole('heading', { name: 'Đăng nhập' })).toBeTruthy();
    expect(router.state.location.pathname).toBe('/login');
    expect(router.state.location.state).toEqual({ from: '/dashboard' });
  });

  it('shows the signed-in name and published courses', async () => {
    setAccessToken('token');
    auth.fetchCurrentUser.mockResolvedValue(student);
    courses.listCoursesPage.mockResolvedValue(mockPage([course('Intro to Algebra')]));

    renderDashboard();

    expect(await screen.findByRole('heading', { name: 'Chào mừng trở lại, Minh Student' })).toBeTruthy();
    expect(await screen.findByRole('heading', { name: 'Intro to Algebra' })).toBeTruthy();
    expect(screen.getByText('Miễn phí')).toBeTruthy();
    expect(courses.listCoursesPage).toHaveBeenCalledWith(
      'token',
      expect.objectContaining({ published: true, page: 0 }),
    );
    const exploreLinks = screen.getAllByRole('link', { name: 'Khám phá khóa học' });
    expect(exploreLinks.length).toBeGreaterThan(0);
    for (const link of exploreLinks) {
      expect(link.getAttribute('href')).toBe('/courses');
    }
  });

  it('shows real enrollment stats from the API', async () => {
    setAccessToken('token');
    auth.fetchCurrentUser.mockResolvedValue(student);
    enrollments.listMyEnrollments.mockResolvedValue([
      {
        id: 'e1',
        userId: 'u1',
        courseId: 'c1',
        courseTitle: 'HSK 1',
        status: 'ACTIVE',
        enrolledAt: '2026-01-01T00:00:00Z',
      },
      {
        id: 'e2',
        userId: 'u1',
        courseId: 'c2',
        courseTitle: 'HSK 2',
        status: 'COMPLETED',
        enrolledAt: '2026-01-01T00:00:00Z',
      },
    ]);

    renderDashboard();

    await screen.findByRole('heading', { name: 'Chào mừng trở lại, Minh Student' });
    // Stats section: enrolled=2, active=1, completed=1
    expect(await screen.findByText('2')).toBeTruthy();
    expect(await screen.findAllByText('1')).toBeTruthy();
  });

  it('shows continue learning card when there is an active enrollment', async () => {
    setAccessToken('token');
    auth.fetchCurrentUser.mockResolvedValue(student);
    enrollments.listMyEnrollments.mockResolvedValue([
      {
        id: 'e1',
        userId: 'u1',
        courseId: 'c1',
        courseTitle: 'HSK 1',
        status: 'ACTIVE',
        enrolledAt: '2026-01-01T00:00:00Z',
      },
    ]);

    renderDashboard();

    await screen.findByRole('heading', { name: 'Chào mừng trở lại, Minh Student' });
    // ContinueLearningSection shows the course title
    expect(await screen.findByText('HSK 1')).toBeTruthy();
  });

  it('keeps the dashboard usable when the course catalog fails', async () => {
    setAccessToken('token');
    auth.fetchCurrentUser.mockResolvedValue(student);
    courses.listCoursesPage.mockRejectedValue(new ApiError(500, 'database exploded'));

    renderDashboard();

    expect(await screen.findByRole('heading', { name: 'Chào mừng trở lại, Minh Student' })).toBeTruthy();
    const alert = await screen.findByRole('alert');
    expect(alert.textContent).not.toMatch(/database/);
    expect(screen.getByText('Chưa có bài học để tiếp tục')).toBeTruthy();
  });

  it('shows an error state (not zeros) when the enrollments API fails', async () => {
    setAccessToken('token');
    auth.fetchCurrentUser.mockResolvedValue(student);
    enrollments.listMyEnrollments.mockRejectedValue(new ApiError(500, 'db down'));

    renderDashboard();

    await screen.findByRole('heading', { name: 'Chào mừng trở lại, Minh Student' });
    // Stats section must NOT show zeros — that would be misleading
    expect(screen.queryByText('0')).toBeNull();
    // Stats shows the unavailable notice
    expect(await screen.findByText('Không tải được thống kê. Vui lòng thử lại sau.')).toBeTruthy();
    // ContinueLearningSection shows an alert with a retry button
    const alerts = await screen.findAllByRole('alert');
    expect(alerts.length).toBeGreaterThan(0);
    expect(screen.getByRole('button', { name: 'Thử lại' })).toBeTruthy();
  });

  it('picks the most recently enrolled ACTIVE course as the resume target', async () => {
    setAccessToken('token');
    auth.fetchCurrentUser.mockResolvedValue(student);
    // API returns older enrollment first — resume target should still be the newer one
    enrollments.listMyEnrollments.mockResolvedValue([
      {
        id: 'e-older',
        userId: 'u1',
        courseId: 'c1',
        courseTitle: 'Khóa cũ',
        status: 'ACTIVE',
        enrolledAt: '2026-01-01T00:00:00Z',
      },
      {
        id: 'e-newer',
        userId: 'u1',
        courseId: 'c2',
        courseTitle: 'Khóa mới',
        status: 'ACTIVE',
        enrolledAt: '2026-06-01T00:00:00Z',
      },
    ]);

    renderDashboard();

    await screen.findByRole('heading', { name: 'Chào mừng trở lại, Minh Student' });
    // The newer enrollment's title should appear in the continue-learning section
    expect(await screen.findByText('Khóa mới')).toBeTruthy();
    // The older one should NOT be the resume target
    expect(screen.queryByText('Khóa cũ')).toBeNull();
  });

  it('shows an empty catalog without inventing courses', async () => {
    setAccessToken('token');
    auth.fetchCurrentUser.mockResolvedValue(student);
    courses.listCoursesPage.mockResolvedValue(mockPage([]));

    renderDashboard();

    expect(await screen.findByText('Chưa có khóa học đã xuất bản')).toBeTruthy();
  });

  it('logs out through the existing session flow', async () => {
    setAccessToken('token');
    auth.fetchCurrentUser.mockResolvedValue(student);

    const router = renderDashboard();
    await screen.findByRole('heading', { name: 'Chào mừng trở lại, Minh Student' });
    fireEvent.click(screen.getByRole('button', { name: 'Đăng xuất' }));

    await waitFor(() => expect(router.state.location.pathname).toBe('/login'));
    expect(sessionStorage.getItem('lms.accessToken')).toBeNull();
  });
});
