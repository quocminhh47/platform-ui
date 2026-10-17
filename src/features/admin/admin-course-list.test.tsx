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
import * as adminCoursesApi from './api/admin-courses.api';
import { AdminRoute } from './components/AdminRoute';
import { AdminCourseListPage } from './pages/AdminCourseListPage';

vi.mock('../auth/api/auth.api', () => ({
  fetchCurrentUser: vi.fn(),
  login: vi.fn(),
  register: vi.fn(),
}));

vi.mock('./api/admin-courses.api', () => ({
  listAllCourses: vi.fn(),
  publishCourse: vi.fn(),
  unpublishCourse: vi.fn(),
}));

const auth = vi.mocked(authApi);
const coursesApi = vi.mocked(adminCoursesApi);

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
  coursesApi.listAllCourses.mockReset();
  coursesApi.publishCourse.mockReset();
  coursesApi.unpublishCourse.mockReset();
  setAccessToken('admin-token');
  auth.fetchCurrentUser.mockResolvedValue(admin);
});

describe('AdminCourseListPage', () => {
  it('loads and displays courses including unpublished ones', async () => {
    coursesApi.listAllCourses.mockResolvedValue([
      sampleCourse(),
      sampleCourse({ id: 'course-2', title: 'Published', published: true }),
    ]);

    renderList();

    expect(await screen.findByText('HSK 1')).toBeTruthy();
    expect(screen.getAllByText('Nguyen Van A').length).toBe(2);
    expect(screen.getByText('Chưa xuất bản')).toBeTruthy();
    expect(screen.getByText('Đã xuất bản')).toBeTruthy();
    expect(screen.getAllByText('3 bài học').length).toBe(2);
    expect(coursesApi.listAllCourses).toHaveBeenCalledWith('admin-token');
  });

  it('shows empty state when there are no courses', async () => {
    coursesApi.listAllCourses.mockResolvedValue([]);

    renderList();

    expect(await screen.findByText('Chưa có khóa học nào')).toBeTruthy();
    expect(screen.getAllByRole('link', { name: 'Tạo khóa học' }).length).toBeGreaterThan(0);
  });

  it('shows error state and retries loading', async () => {
    coursesApi.listAllCourses
      .mockRejectedValueOnce(new ApiError(500, 'fail'))
      .mockResolvedValueOnce([sampleCourse()]);

    renderList();

    const alert = await screen.findByRole('alert');
    expect(alert.textContent).toMatch(/Không thể tải danh sách khóa học/);
    fireEvent.click(screen.getByRole('button', { name: 'Thử lại' }));

    expect(await screen.findByText('HSK 1')).toBeTruthy();
    expect(coursesApi.listAllCourses).toHaveBeenCalledTimes(2);
  });

  it('publishes a course and refreshes the list', async () => {
    coursesApi.listAllCourses
      .mockResolvedValueOnce([sampleCourse()])
      .mockResolvedValueOnce([sampleCourse({ published: true })]);
    coursesApi.publishCourse.mockResolvedValue(sampleCourse({ published: true }));

    renderList();

    await screen.findByText('HSK 1');
    fireEvent.click(screen.getByRole('button', { name: 'Xuất bản' }));

    await waitFor(() =>
      expect(coursesApi.publishCourse).toHaveBeenCalledWith('admin-token', 'course-1'),
    );
    const toast = await screen.findByRole('status');
    expect(toast.textContent).toContain('Khóa học đã được xuất bản.');
    expect(coursesApi.listAllCourses).toHaveBeenCalledTimes(2);
  });
});
