import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { RouterProvider, createMemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../../app/providers/AuthProvider';
import { ToastProvider } from '../../components/feedback/ToastProvider';
import { ApiError } from '../../services/api/api-error';
import { setAccessToken } from '../../services/api/token-storage';
import * as authApi from '../auth/api/auth.api';
import { ProtectedRoute } from '../auth/components/ProtectedRoute';
import type { User } from '../auth/types/auth.types';
import * as adminCoursesApi from './api/admin-courses.api';
import * as adminUsersApi from './api/admin-users.api';
import * as catalogCoursesApi from '../catalog/api/courses.api';
import type { Course } from '../catalog/types/course.types';
import { AdminRoute } from './components/AdminRoute';
import { AdminCourseFormPage } from './pages/AdminCourseFormPage';
import { mockPage } from '../../testing/mockPageResponse';

vi.mock('../auth/api/auth.api', () => ({
  fetchCurrentUser: vi.fn(),
  login: vi.fn(),
  register: vi.fn(),
}));

vi.mock('./api/admin-courses.api', () => ({
  listAdminCoursesPage: vi.fn(),
  createCourse: vi.fn(),
  updateCourse: vi.fn(),
  publishCourse: vi.fn(),
  unpublishCourse: vi.fn(),
}));

vi.mock('./api/admin-users.api', () => ({
  listUsersPage: vi.fn(),
}));

vi.mock('../catalog/api/courses.api', () => ({
  getCourseById: vi.fn(),
  listCoursesPage: vi.fn(),
  listCourseSections: vi.fn(),
  listSectionLessons: vi.fn(),
}));

const auth = vi.mocked(authApi);
const adminCourses = vi.mocked(adminCoursesApi);
const adminUsers = vi.mocked(adminUsersApi);
const catalogCourses = vi.mocked(catalogCoursesApi);

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

const instructor: User = {
  id: 'inst-1',
  email: 'teacher@example.com',
  fullName: 'Giảng viên A',
  role: 'INSTRUCTOR',
  avatarUrl: null,
  active: true,
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
};

const sampleCourse: Course = {
  id: 'course-1',
  title: 'HSK 1',
  description: 'Mô tả',
  instructorId: 'inst-1',
  instructorName: 'Giảng viên A',
  price: 0,
  lessonCount: 2,
  published: false,
  finalQuizId: null,
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
};

function renderForm(initialPath: string) {
  const router = createMemoryRouter(
    [
      {
        element: <ProtectedRoute />,
        children: [
          { path: '/admin/courses', element: <p>Course list</p> },
          {
            element: <AdminRoute />,
            children: [
              { path: '/admin/courses/new', element: <AdminCourseFormPage /> },
              { path: '/admin/courses/:courseId', element: <AdminCourseFormPage /> },
            ],
          },
        ],
      },
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
  adminCourses.createCourse.mockReset();
  adminCourses.updateCourse.mockReset();
  adminUsers.listUsersPage.mockReset();
  catalogCourses.getCourseById.mockReset();
  setAccessToken('admin-token');
  auth.fetchCurrentUser.mockResolvedValue(admin);
});

describe('AdminCourseFormPage create', () => {
  it('filters instructors and creates a course', async () => {
    adminUsers.listUsersPage.mockResolvedValue(
      mockPage([
        instructor,
        { ...instructor, id: 'student-1', role: 'STUDENT', fullName: 'Student' },
      ]),
    );
    adminCourses.createCourse.mockResolvedValue(sampleCourse);

    const router = renderForm('/admin/courses/new');

    expect(await screen.findByRole('heading', { name: 'Tạo khóa học' })).toBeTruthy();
    expect(await screen.findByRole('article', { name: 'Xem trước thẻ khóa học' })).toBeTruthy();

    fireEvent.change(await screen.findByRole('textbox', { name: /Tiêu đề/ }), { target: { value: 'Khóa mới' } });
    fireEvent.change(await screen.findByLabelText(/^Giảng viên/), { target: { value: 'inst-1' } });
    fireEvent.click(screen.getByRole('button', { name: 'Tạo khóa học' }));

    await waitFor(() =>
      expect(adminCourses.createCourse).toHaveBeenCalledWith('admin-token', {
        title: 'Khóa mới',
        description: null,
        instructorId: 'inst-1',
        price: 0,
        thumbnailUrl: null,
        published: false,
      }),
    );
    await waitFor(() => expect(router.state.location.pathname).toBe('/admin/courses'));
    expect(await screen.findByRole('status')).toBeTruthy();
  });

  it('updates the live preview when form values change', async () => {
    adminUsers.listUsersPage.mockResolvedValue(mockPage([instructor]));

    renderForm('/admin/courses/new');
    const preview = await screen.findByRole('article', { name: 'Xem trước thẻ khóa học' });

    expect(preview.querySelector('h3')?.textContent).toBe('Tiêu đề khóa học');
    expect(preview.textContent).toContain('Chưa có mô tả.');
    expect(preview.textContent).toContain('Miễn phí');
    expect(preview.textContent).toContain('Chưa xuất bản');

    fireEvent.change(screen.getByRole('textbox', { name: /Tiêu đề/ }), {
      target: { value: 'Khóa preview' },
    });
    fireEvent.change(screen.getByRole('textbox', { name: /Mô tả/ }), {
      target: { value: 'Mô tả ngắn' },
    });
    fireEvent.change(screen.getByRole('combobox', { name: /Giảng viên/ }), {
      target: { value: 'inst-1' },
    });
    const publishCheckbox = screen.getByRole('checkbox', { name: /Xuất bản khóa học/ });
    expect(publishCheckbox.className).toContain('admin-course-published-input');
    fireEvent.click(publishCheckbox);

    expect(preview.querySelector('h3')?.textContent).toBe('Khóa preview');
    expect(preview.textContent).toContain('Mô tả ngắn');
    expect(preview.textContent).toContain('Giảng viên A');
    expect(preview.textContent).toContain('Đã xuất bản');
  });

  it('keeps price input and Miễn phí checkbox on one row with free disabling the input', async () => {
    adminUsers.listUsersPage.mockResolvedValue(mockPage([instructor]));

    renderForm('/admin/courses/new');
    const priceInput = (await screen.findByRole('spinbutton', {
      name: /Giá khóa học/,
    })) as HTMLInputElement;
    const freeCheckbox = screen.getByRole('checkbox', { name: 'Miễn phí' });

    expect(priceInput.closest('.admin-course-price-row')).toBeTruthy();
    expect(freeCheckbox.closest('.admin-course-price-free')).toBeTruthy();
    expect(priceInput.disabled).toBe(true);
    expect(priceInput.value).toBe('0');

    fireEvent.click(freeCheckbox);
    expect(priceInput.disabled).toBe(false);

    fireEvent.change(priceInput, { target: { value: '150000' } });
    expect(priceInput.value).toBe('150000');

    fireEvent.click(freeCheckbox);
    expect(priceInput.disabled).toBe(true);
    expect(priceInput.value).toBe('0');
  });

  it('shows validation errors without calling the API', async () => {
    adminUsers.listUsersPage.mockResolvedValue(mockPage([instructor]));

    renderForm('/admin/courses/new');
    await screen.findByRole('textbox', { name: /Tiêu đề/ });

    fireEvent.click(screen.getByRole('button', { name: 'Tạo khóa học' }));

    expect(await screen.findByText('Vui lòng nhập tiêu đề khóa học.')).toBeTruthy();
    expect(screen.getByText('Vui lòng chọn giảng viên.')).toBeTruthy();
    expect(adminCourses.createCourse).not.toHaveBeenCalled();
  });

  it('keeps form data when the API fails', async () => {
    adminUsers.listUsersPage.mockResolvedValue(mockPage([instructor]));
    adminCourses.createCourse.mockRejectedValue(new ApiError(400, 'Only free courses'));

    renderForm('/admin/courses/new');
    await screen.findByRole('textbox', { name: /Tiêu đề/ });

    fireEvent.change(screen.getByRole('textbox', { name: /Tiêu đề/ }), { target: { value: 'Khóa mới' } });
    fireEvent.change(screen.getByLabelText(/^Giảng viên/), { target: { value: 'inst-1' } });
    fireEvent.click(screen.getByRole('button', { name: 'Tạo khóa học' }));

    expect((await screen.findByRole('alert')).textContent).toContain('Only free courses');
    expect((screen.getByRole('textbox', { name: /Tiêu đề/ }) as HTMLInputElement).value).toBe('Khóa mới');
  });
});

describe('AdminCourseFormPage edit', () => {
  it('loads course data and shows read-only instructor', async () => {
    catalogCourses.getCourseById.mockResolvedValue(sampleCourse);

    renderForm('/admin/courses/course-1');

    expect(await screen.findByRole('heading', { name: 'Sửa khóa học' })).toBeTruthy();
    expect(((await screen.findByRole('textbox', { name: /Tiêu đề/ })) as HTMLInputElement).value).toBe(
      'HSK 1',
    );
    expect(document.getElementById('admin-course-instructor-readonly')?.textContent).toMatch(
      /Giảng viên A/,
    );
    const preview = screen.getByRole('article', { name: 'Xem trước thẻ khóa học' });
    expect(preview.querySelector('h3')?.textContent).toBe('HSK 1');
    expect(preview.textContent).toContain('Mô tả');
    expect(screen.queryByRole('combobox')).toBeNull();
    expect(screen.getByText(/Giảng viên không thể thay đổi/)).toBeTruthy();
    expect(adminUsers.listUsersPage).not.toHaveBeenCalled();
  });

  it('updates a course, reloads detail, and stays on the edit page', async () => {
    catalogCourses.getCourseById.mockResolvedValue(sampleCourse);
    adminCourses.updateCourse.mockResolvedValue({ ...sampleCourse, title: 'HSK 1 cập nhật' });

    const router = renderForm('/admin/courses/course-1');
    await screen.findByRole('textbox', { name: /Tiêu đề/ });
    expect(screen.getByText('Chỉnh sửa thông tin khóa học')).toBeTruthy();

    fireEvent.change(screen.getByRole('textbox', { name: /Tiêu đề/ }), { target: { value: 'HSK 1 cập nhật' } });
    fireEvent.click(screen.getByRole('checkbox', { name: /Xuất bản khóa học/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Lưu thay đổi' }));

    await waitFor(() =>
      expect(adminCourses.updateCourse).toHaveBeenCalledWith('admin-token', 'course-1', {
        title: 'HSK 1 cập nhật',
        description: 'Mô tả',
        price: 0,
        thumbnailUrl: null,
        published: true,
      }),
    );
    await waitFor(() => expect(catalogCourses.getCourseById).toHaveBeenCalledTimes(2));
    expect(router.state.location.pathname).toBe('/admin/courses/course-1');
    expect(await screen.findByRole('status')).toBeTruthy();
  });

  it('navigates away on cancel without saving', async () => {
    catalogCourses.getCourseById.mockResolvedValue(sampleCourse);

    const router = renderForm('/admin/courses/course-1');
    await screen.findByRole('textbox', { name: /Tiêu đề/ });

    fireEvent.change(screen.getByRole('textbox', { name: /Tiêu đề/ }), {
      target: { value: 'Thay đổi chưa lưu' },
    });
    fireEvent.click(screen.getByRole('link', { name: 'Hủy' }));

    expect(router.state.location.pathname).toBe('/admin/courses');
    expect(adminCourses.updateCourse).not.toHaveBeenCalled();
  });

  it('rejects invalid thumbnail URLs before calling the API', async () => {
    adminUsers.listUsersPage.mockResolvedValue(mockPage([instructor]));

    renderForm('/admin/courses/new');
    await screen.findByRole('textbox', { name: /Tiêu đề/ });

    fireEvent.change(screen.getByRole('textbox', { name: /Tiêu đề/ }), { target: { value: 'Khóa mới' } });
    fireEvent.change(screen.getByLabelText(/^Giảng viên/), { target: { value: 'inst-1' } });
    fireEvent.change(screen.getByLabelText(/^URL ảnh bìa/), {
      target: { value: 'not-a-url' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Tạo khóa học' }));

    expect(await screen.findByText('URL không hợp lệ.')).toBeTruthy();
    expect(adminCourses.createCourse).not.toHaveBeenCalled();
  });

  it('prevents duplicate create submissions while the request is in flight', async () => {
    adminUsers.listUsersPage.mockResolvedValue(mockPage([instructor]));
    let resolveCreate!: () => void;
    adminCourses.createCourse.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveCreate = () => resolve(sampleCourse);
        }),
    );

    renderForm('/admin/courses/new');
    await screen.findByRole('textbox', { name: /Tiêu đề/ });

    fireEvent.change(screen.getByRole('textbox', { name: /Tiêu đề/ }), { target: { value: 'Khóa mới' } });
    fireEvent.change(screen.getByLabelText(/^Giảng viên/), { target: { value: 'inst-1' } });
    const submit = screen.getByRole('button', { name: 'Tạo khóa học' });
    fireEvent.click(submit);
    fireEvent.click(submit);

    await waitFor(() => expect(adminCourses.createCourse).toHaveBeenCalledTimes(1));
    resolveCreate();
    await waitFor(() => expect(screen.getByText('Course list')).toBeTruthy());
    expect(adminCourses.createCourse).toHaveBeenCalledTimes(1);
  });
});
