import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { ApiError } from '../../services/api/api-error';
import { RouterProvider, createMemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../../app/providers/AuthProvider';
import { setAccessToken } from '../../services/api/token-storage';
import { mockPage } from '../../testing/mockPageResponse';
import * as authApi from '../auth/api/auth.api';
import { ProtectedRoute } from '../auth/components/ProtectedRoute';
import type { User } from '../auth/types/auth.types';
import type { Course } from '../catalog/types/course.types';
import * as adminCoursesApi from './api/admin-courses.api';
import * as adminMetricsApi from './api/admin-metrics.api';
import { AdminRoute } from './components/AdminRoute';
import { AdminDashboardPage } from './pages/AdminDashboardPage';

vi.mock('../auth/api/auth.api', () => ({
  fetchCurrentUser: vi.fn(),
  login: vi.fn(),
  register: vi.fn(),
}));

vi.mock('./api/admin-courses.api', () => ({
  listAdminCoursesPage: vi.fn(),
}));

vi.mock('./api/admin-metrics.api', () => ({
  fetchCourseMetrics: vi.fn(),
  fetchStudentMetrics: vi.fn(),
}));

const auth = vi.mocked(authApi);
const coursesApi = vi.mocked(adminCoursesApi);
const metricsApi = vi.mocked(adminMetricsApi);

const admin: User = {
  id: 'u-admin',
  email: 'admin@example.com',
  fullName: 'Admin User',
  role: 'ADMIN',
  avatarUrl: null,
  active: true,
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
};

const sampleCourse: Course = {
  id: 'course-1',
  title: 'HSK 1',
  description: null,
  instructorId: 'inst-1',
  instructorName: 'Teacher',
  price: 0,
  lessonCount: 2,
  published: true,
  finalQuizId: null,
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-02T00:00:00Z',
};

function renderDashboard() {
  const router = createMemoryRouter(
    [
      {
        element: <ProtectedRoute />,
        children: [
          {
            element: <AdminRoute />,
            children: [
              { path: '/admin', element: <AdminDashboardPage /> },
              { path: '/admin/courses/new', element: <p>Create course</p> },
              { path: '/admin/courses', element: <p>Course list</p> },
            ],
          },
        ],
      },
    ],
    { initialEntries: ['/admin'] },
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
  coursesApi.listAdminCoursesPage.mockReset();
  metricsApi.fetchCourseMetrics.mockReset();
  metricsApi.fetchStudentMetrics.mockReset();
  setAccessToken('admin-token');
  auth.fetchCurrentUser.mockResolvedValue(admin);
});

describe('AdminDashboardPage', () => {
  it('shows course metrics from aggregate endpoints', async () => {
    metricsApi.fetchCourseMetrics.mockResolvedValue({
      total: 2,
      published: 1,
      draft: 1,
      withLessons: 1,
      emptyCurriculum: 1,
    });
    metricsApi.fetchStudentMetrics.mockResolvedValue({ activeStudentAccounts: 1 });
    coursesApi.listAdminCoursesPage.mockResolvedValue(mockPage([sampleCourse]));

    renderDashboard();

    expect(await screen.findByRole('heading', { name: 'Tổng quan quản trị' })).toBeTruthy();
    await waitFor(() => expect(statValue('Tổng khóa học')).toBe('2'));
    expect(statValue('Đã xuất bản')).toBe('1');
    expect(statValue('Chưa xuất bản')).toBe('1');
    expect(statValue('Tài khoản học viên đang hoạt động')).toBe('1');
  });

  it('does not show zero course metrics when the courses API fails', async () => {
    metricsApi.fetchCourseMetrics.mockRejectedValue(new ApiError(500, 'fail'));
    metricsApi.fetchStudentMetrics.mockResolvedValue({ activeStudentAccounts: 0 });
    coursesApi.listAdminCoursesPage.mockResolvedValue(mockPage([]));

    renderDashboard();

    const alert = await screen.findByRole('alert');
    expect(alert.textContent).toMatch(/Không thể tải thống kê khóa học/);
    expect(screen.queryByText('Tổng khóa học')).toBeNull();
  });

  it('retries student count without fabricating a zero', async () => {
    metricsApi.fetchCourseMetrics.mockResolvedValue({
      total: 1,
      published: 1,
      draft: 0,
      withLessons: 1,
      emptyCurriculum: 0,
    });
    metricsApi.fetchStudentMetrics
      .mockRejectedValueOnce(new ApiError(500, 'fail'))
      .mockResolvedValueOnce({ activeStudentAccounts: 1 });
    coursesApi.listAdminCoursesPage.mockResolvedValue(mockPage([sampleCourse]));

    renderDashboard();
    await screen.findByText('Tổng khóa học');

    expect(await screen.findByText(/Không thể tải số tài khoản học viên/)).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Thử lại thống kê học viên' }));

    await waitFor(() => expect(metricsApi.fetchStudentMetrics).toHaveBeenCalledTimes(2));
    await waitFor(() => expect(statValue('Tài khoản học viên đang hoạt động')).toBe('1'));
  });

  it('renders all five overview metrics in one grid with shared card structure', async () => {
    metricsApi.fetchCourseMetrics.mockResolvedValue({
      total: 5,
      published: 3,
      draft: 2,
      withLessons: 4,
      emptyCurriculum: 1,
    });
    metricsApi.fetchStudentMetrics.mockResolvedValue({ activeStudentAccounts: 7 });
    coursesApi.listAdminCoursesPage.mockResolvedValue(mockPage([sampleCourse]));

    renderDashboard();
    await screen.findByText('Tổng quan nội dung');

    const grid = document.querySelector('.admin-stat-grid-overview');
    expect(grid).toBeTruthy();
    expect(grid?.querySelectorAll('.admin-stat-card')).toHaveLength(5);
    expect(within(grid as HTMLElement).getByText('Tài khoản học viên đang hoạt động')).toBeTruthy();
    expect(statValue('Có bài học')).toBe('4');
  });

  it('links quick actions to existing admin routes', async () => {
    metricsApi.fetchCourseMetrics.mockResolvedValue({
      total: 1,
      published: 1,
      draft: 0,
      withLessons: 1,
      emptyCurriculum: 0,
    });
    metricsApi.fetchStudentMetrics.mockResolvedValue({ activeStudentAccounts: 0 });
    coursesApi.listAdminCoursesPage.mockResolvedValue(mockPage([sampleCourse]));

    const router = renderDashboard();
    await screen.findByText('Thao tác nhanh');

    fireEvent.click(screen.getByRole('link', { name: /Tạo khóa học mới/ }));
    expect(router.state.location.pathname).toBe('/admin/courses/new');
  });
});

function statValue(label: string): string | undefined {
  for (const grid of screen.getAllByRole('list')) {
    if (!grid.classList.contains('admin-stat-grid')) {
      continue;
    }
    const labelEl = within(grid).queryByText(label);
    if (labelEl) {
      return labelEl.parentElement?.querySelector('.admin-stat-value')?.textContent ?? undefined;
    }
  }
  return undefined;
}
