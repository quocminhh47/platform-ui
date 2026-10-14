import { fireEvent, render, screen } from '@testing-library/react';
import { RouterProvider, createMemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../../app/providers/AuthProvider';
import { AppShell } from '../../components/layout/AppShell';
import { ApiError } from '../../services/api/api-error';
import { setAccessToken } from '../../services/api/token-storage';
import * as authApi from '../auth/api/auth.api';
import type { User } from '../auth/types/auth.types';
import { HomePage } from '../../pages/HomePage';
import * as coursesApi from './api/courses.api';
import { CatalogPage } from './pages/CatalogPage';
import type { Course } from './types/course.types';

vi.mock('../auth/api/auth.api', () => ({
  fetchCurrentUser: vi.fn(),
  login: vi.fn(),
  register: vi.fn(),
}));

vi.mock('./api/courses.api', () => ({
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

const COURSE_ID = '11111111-1111-4111-8111-111111111111';

function course(title: string, price = 0, id = COURSE_ID): Course {
  return {
    id,
    title,
    description: 'A published course',
    instructorId: 'instructor-1',
    price,
    published: true,
    finalQuizId: null,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  };
}

function renderAt(path: string) {
  const router = createMemoryRouter(
    [
      {
        path: '/',
        element: <AppShell />,
        children: [
          { index: true, element: <HomePage /> },
          { path: 'courses', element: <CatalogPage /> },
        ],
      },
    ],
    { initialEntries: [path] },
  );
  render(
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>,
  );
}

beforeEach(() => {
  sessionStorage.clear();
  auth.fetchCurrentUser.mockReset();
  courses.listPublishedCourses.mockReset();
  courses.listPublishedCourses.mockResolvedValue([]);
});

describe('public home', () => {
  it('offers home, catalog, and guest account actions', async () => {
    renderAt('/');

    expect(await screen.findByRole('heading', { name: /Kho học liệu/ })).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Trang chủ' })).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Khóa học' })).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Đăng nhập' })).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Đăng ký' })).toBeTruthy();
    expect((screen.getByRole('button', { name: 'Cá nhân' }) as HTMLButtonElement).disabled).toBe(true);
    expect(screen.getByRole('searchbox', { name: 'Tìm kiếm học liệu' })).toBeTruthy();
    expect(screen.getByText(/không tìm trên toàn bộ cơ sở dữ liệu/i)).toBeTruthy();
    expect(screen.queryByRole('tablist')).toBeNull();
    expect(screen.queryByRole('button', { name: /Thông báo/ })).toBeNull();
    expect(screen.getByRole('link', { name: 'Xem khóa học' }).getAttribute('href')).toBe('/courses');
    expect((screen.getByRole('button', { name: 'Tạo học liệu AI' }) as HTMLButtonElement).disabled).toBe(true);
  });

  it('shows the dashboard action for a signed-in user', async () => {
    setAccessToken('token');
    auth.fetchCurrentUser.mockResolvedValue(student);

    renderAt('/');

    expect(await screen.findByRole('link', { name: 'Cá nhân' })).toBeTruthy();
    expect(screen.queryByRole('link', { name: 'Đăng nhập' })).toBeNull();
  });

  it('shows published courses and keeps a contained error from replacing the page', async () => {
    courses.listPublishedCourses.mockResolvedValueOnce([
      course('Intro to Algebra', 0, '11111111-1111-4111-8111-111111111101'),
      course('Academic Writing', 49, '11111111-1111-4111-8111-111111111102'),
      course('Biology Basics', 0, '11111111-1111-4111-8111-111111111103'),
      course('Hidden Fourth', 0, '11111111-1111-4111-8111-111111111104'),
    ]);

    renderAt('/');

    expect(await screen.findByRole('heading', { name: 'Intro to Algebra' })).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Academic Writing' })).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Hidden Fourth' })).toBeTruthy();
    expect(screen.getAllByText('Miễn phí').length).toBeGreaterThan(0);
    expect(screen.getByRole('link', { name: /Intro to Algebra/ }).getAttribute('href')).toBe(
      '/courses/11111111-1111-4111-8111-111111111101',
    );
    expect(courses.listPublishedCourses).toHaveBeenCalledWith(null);
    expect(screen.getByRole('heading', { name: /Kho học liệu/ })).toBeTruthy();
  });

  it('shows an empty featured section without invented courses', async () => {
    renderAt('/');

    expect(await screen.findByText('Chưa có khóa học đã xuất bản')).toBeTruthy();
    expect(screen.getByRole('heading', { name: /Kho học liệu/ })).toBeTruthy();
  });

  it('retries a failed featured-course request without hiding the hero', async () => {
    courses.listPublishedCourses
      .mockRejectedValueOnce(new ApiError(500, 'database exploded'))
      .mockResolvedValueOnce([course('Intro to Algebra')]);

    renderAt('/');

    expect(await screen.findByRole('heading', { name: /Kho học liệu/ })).toBeTruthy();
    const alert = await screen.findByRole('alert');
    expect(alert.textContent).not.toMatch(/database/);

    fireEvent.click(screen.getByRole('button', { name: 'Thử lại' }));

    expect(await screen.findByRole('heading', { name: 'Intro to Algebra' })).toBeTruthy();
  });
});

describe('public catalog', () => {
  it('links each course card to its detail page', async () => {
    const algebraId = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
    const writingId = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
    courses.listPublishedCourses.mockResolvedValue([
      course('Intro to Algebra', 0, algebraId),
      course('Academic Writing', 49, writingId),
    ]);

    renderAt('/courses');

    expect(await screen.findByRole('heading', { name: /Kho học liệu/ })).toBeTruthy();
    expect(screen.getByRole('link', { name: /Intro to Algebra/ }).getAttribute('href')).toBe(
      `/courses/${algebraId}`,
    );
    expect(screen.getByRole('link', { name: /Academic Writing/ }).getAttribute('href')).toBe(
      `/courses/${writingId}`,
    );
    expect(screen.queryByRole('button', { name: /enroll|view/i })).toBeNull();
  });

  it('shows an empty catalog', async () => {
    renderAt('/courses');

    expect(await screen.findByText('Chưa có khóa học đã xuất bản')).toBeTruthy();
  });
});
