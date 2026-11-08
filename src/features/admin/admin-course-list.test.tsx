import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { RouterProvider, createMemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../../app/providers/AuthProvider';
import { ToastProvider } from '../../components/feedback/ToastProvider';
import { ApiError } from '../../services/api/api-error';
import { setAccessToken } from '../../services/api/token-storage';
import * as authApi from '../auth/api/auth.api';
import { ProtectedRoute } from '../auth/components/ProtectedRoute';
import type { User } from '../auth/types/auth.types';
import type { Course } from '../catalog/types/course.types';
import { mockPage } from '../../testing/mockPageResponse';
import * as adminMetricsApi from './api/admin-metrics.api';
import * as adminCoursesApi from './api/admin-courses.api';
import { AdminRoute } from './components/AdminRoute';
import { AdminCourseListPage } from './pages/AdminCourseListPage';

vi.mock('../auth/api/auth.api', () => ({
  fetchCurrentUser: vi.fn(),
  login: vi.fn(),
  register: vi.fn(),
}));

vi.mock('./api/admin-courses.api', () => ({
  listAdminCoursesPage: vi.fn(),
  publishCourse: vi.fn(),
  unpublishCourse: vi.fn(),
}));

vi.mock('./api/admin-metrics.api', () => ({
  fetchCourseMetrics: vi.fn(),
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

function sampleCourse(overrides: Partial<Course> = {}): Course {
  return {
    id: 'course-1',
    title: 'HSK 1',
    description: null,
    instructorId: 'inst-1',
    instructorName: 'Nguyen Van A',
    price: 0,
    lessonCount: 3,
    published: false,
    finalQuizId: null,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
    ...overrides,
  };
}

function renderList() {
  const router = createMemoryRouter(
    [
      {
        element: <ProtectedRoute />,
        children: [
          {
            element: <AdminRoute />,
            children: [{ path: '/admin/courses', element: <AdminCourseListPage /> }],
          },
        ],
      },
    ],
    { initialEntries: ['/admin/courses'] },
  );

  render(
    <AuthProvider>
      <ToastProvider>
        <RouterProvider router={router} />
      </ToastProvider>
    </AuthProvider>,
  );
}

beforeEach(() => {
  sessionStorage.clear();
  auth.fetchCurrentUser.mockReset();
  coursesApi.listAdminCoursesPage.mockReset();
  coursesApi.publishCourse.mockReset();
  coursesApi.unpublishCourse.mockReset();
  metricsApi.fetchCourseMetrics.mockReset();
  metricsApi.fetchCourseMetrics.mockResolvedValue({
    total: 2,
    published: 1,
    draft: 1,
    withLessons: 2,
    emptyCurriculum: 0,
  });
  setAccessToken('admin-token');
  auth.fetchCurrentUser.mockResolvedValue(admin);
});

describe('AdminCourseListPage', () => {
  it('loads and displays courses including unpublished ones', async () => {
    coursesApi.listAdminCoursesPage.mockResolvedValue(
      mockPage([sampleCourse(), sampleCourse({ id: 'course-2', title: 'Published', published: true })]),
    );

    renderList();

    expect(await screen.findByText('HSK 1')).toBeTruthy();
    expect(screen.getAllByText('Nguyen Van A').length).toBe(2);
    expect(screen.getByText('Chưa xuất bản')).toBeTruthy();
    expect(screen.getByText('Đã xuất bản')).toBeTruthy();
    expect(screen.getAllByText('3 bài học').length).toBe(2);
    expect(coursesApi.listAdminCoursesPage).toHaveBeenCalled();
  });

  it('shows empty state when there are no courses', async () => {
    metricsApi.fetchCourseMetrics.mockResolvedValue({
      total: 0,
      published: 0,
      draft: 0,
      withLessons: 0,
      emptyCurriculum: 0,
    });
    coursesApi.listAdminCoursesPage.mockResolvedValue(mockPage([]));

    renderList();

    expect(await screen.findByText('Chưa có khóa học nào')).toBeTruthy();
    expect(screen.getAllByRole('link', { name: /Tạo khóa học/ }).length).toBeGreaterThan(0);
  });

  it('shows error state and retries loading', async () => {
    coursesApi.listAdminCoursesPage
      .mockRejectedValueOnce(new ApiError(500, 'fail'))
      .mockResolvedValueOnce(mockPage([sampleCourse()]));

    renderList();

    const alert = await screen.findByRole('alert');
    expect(alert.textContent).toMatch(/Không thể tải danh sách khóa học/);
    fireEvent.click(screen.getByRole('button', { name: 'Thử lại' }));

    expect(await screen.findByText('HSK 1')).toBeTruthy();
    expect(coursesApi.listAdminCoursesPage).toHaveBeenCalledTimes(2);
  });

  it('filters courses by search query and status', async () => {
    const all = [
      sampleCourse({ title: 'Alpha Course', published: true }),
      sampleCourse({ id: 'course-2', title: 'Beta Draft', published: false, instructorName: 'Other' }),
    ];
    coursesApi.listAdminCoursesPage.mockImplementation(async (_token, params) => {
      let rows = all;
      const q = params?.q?.toLowerCase() ?? '';
      if (q.includes('beta')) {
        rows = all.filter((c) => c.title.toLowerCase().includes('beta'));
      }
      if (params?.published === true) {
        rows = rows.filter((c) => c.published);
      }
      if (params?.published === false) {
        rows = rows.filter((c) => !c.published);
      }
      return mockPage(rows, { totalElements: rows.length });
    });

    renderList();
    await screen.findByText('Alpha Course');

    fireEvent.change(screen.getByPlaceholderText(/Tìm kiếm/), {
      target: { value: 'beta' },
    });
    await waitFor(() => {
      expect(screen.getByText('Beta Draft')).toBeTruthy();
      expect(screen.queryByText('Alpha Course')).toBeNull();
      expect(screen.getByText(/Hiển thị 1 \/ 2 khóa học/)).toBeTruthy();
    });

    fireEvent.change(screen.getByPlaceholderText(/Tìm kiếm/), { target: { value: '' } });
    fireEvent.change(screen.getByDisplayValue('Tất cả trạng thái'), {
      target: { value: 'published' },
    });
    await waitFor(() => {
      expect(screen.getByText('Alpha Course')).toBeTruthy();
      expect(screen.queryByText('Beta Draft')).toBeNull();
    });
  });

  it('shows curriculum and updated metadata in the table', async () => {
    coursesApi.listAdminCoursesPage.mockResolvedValue(
      mockPage([sampleCourse({ lessonCount: 0, updatedAt: '2026-03-15T10:30:00Z' })]),
    );

    renderList();
    await screen.findByText('HSK 1');

    expect(screen.getByText('Chưa có bài học')).toBeTruthy();
    expect(screen.getByText('Giáo trình trống')).toBeTruthy();
  });

  it('publishes a course and refreshes the list', async () => {
    coursesApi.listAdminCoursesPage
      .mockResolvedValueOnce(mockPage([sampleCourse()]))
      .mockResolvedValueOnce(mockPage([sampleCourse({ published: true })]));
    coursesApi.publishCourse.mockResolvedValue(sampleCourse({ published: true }));

    renderList();

    await screen.findByText('HSK 1');
    fireEvent.click(screen.getByRole('button', { name: 'Xuất bản' }));

    await waitFor(() =>
      expect(coursesApi.publishCourse).toHaveBeenCalledWith('admin-token', 'course-1'),
    );
    const toast = await screen.findByRole('status');
    expect(toast.textContent).toContain('Khóa học đã được xuất bản.');
    expect(coursesApi.listAdminCoursesPage).toHaveBeenCalledTimes(2);
  });
});
