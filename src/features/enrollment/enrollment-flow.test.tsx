import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { RouterProvider, createMemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../../app/providers/AuthProvider';
import { ToastProvider } from '../../components/feedback/ToastProvider';
import { AppShell } from '../../components/layout/AppShell';
import { ApiError } from '../../services/api/api-error';
import { setAccessToken } from '../../services/api/token-storage';
import * as authApi from '../auth/api/auth.api';
import { ProtectedRoute } from '../auth/components/ProtectedRoute';
import { LoginPage } from '../auth/pages/LoginPage';
import type { User } from '../auth/types/auth.types';
import * as coursesApi from '../catalog/api/courses.api';
import { CourseDetailPage } from '../catalog/pages/CourseDetailPage';
import type { Course } from '../catalog/types/course.types';
import * as progressApi from '../learning/api/progress.api';
import * as enrollmentsApi from './api/enrollments.api';
import type { Enrollment } from './api/enrollments.api';
import { ENROLL_SUCCESS_TOAST } from './enrollment-messages';
import { MyCoursesPage } from './pages/MyCoursesPage';

vi.mock('../auth/api/auth.api', () => ({
  fetchCurrentUser: vi.fn(),
  login: vi.fn(),
  register: vi.fn(),
}));

vi.mock('../catalog/api/courses.api', () => ({
  listPublishedCourses: vi.fn(),
  getCourseById: vi.fn(),
  listCourseSections: vi.fn(),
  listSectionLessons: vi.fn(),
}));

vi.mock('./api/enrollments.api', () => ({
  listMyEnrollments: vi.fn(),
  enrollInCourse: vi.fn(),
}));

vi.mock('../learning/api/progress.api', () => ({
  listCourseProgress: vi.fn(),
  completeLessonProgress: vi.fn(),
  getLessonProgress: vi.fn(),
}));

const auth = vi.mocked(authApi);
const courses = vi.mocked(coursesApi);
const enrollments = vi.mocked(enrollmentsApi);
const progress = vi.mocked(progressApi);

const courseId = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';

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

const course: Course = {
  id: courseId,
  title: 'Intro to Algebra',
  description: 'Equations and graphs.',
  instructorId: 'instructor-1',
  price: 0,
  published: true,
  finalQuizId: null,
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
};

function enrollment(status: Enrollment['status'], title = 'Intro to Algebra'): Enrollment {
  return {
    id: `enroll-${status}`,
    userId: student.id,
    courseId,
    courseTitle: title,
    status,
    enrolledAt: '2026-02-01T00:00:00Z',
  };
}

function renderDetail() {
  const router = createMemoryRouter(
    [
      {
        path: '/',
        element: <AppShell />,
        children: [
          { path: 'courses/:courseId', element: <CourseDetailPage /> },
          { path: 'login', element: <LoginPage /> },
        ],
      },
    ],
    { initialEntries: [`/courses/${courseId}`] },
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

function renderMyCourses(path = '/my-courses') {
  const router = createMemoryRouter(
    [
      {
        element: <ProtectedRoute />,
        children: [{ path: '/my-courses', element: <MyCoursesPage /> }],
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
  courses.getCourseById.mockReset();
  courses.listCourseSections.mockReset();
  courses.listSectionLessons.mockReset();
  courses.listPublishedCourses.mockReset();
  courses.listPublishedCourses.mockResolvedValue([]);
  enrollments.listMyEnrollments.mockReset();
  enrollments.enrollInCourse.mockReset();
  progress.listCourseProgress.mockReset();
  progress.listCourseProgress.mockResolvedValue([]);
  courses.getCourseById.mockResolvedValue(course);
  courses.listCourseSections.mockResolvedValue([]);
  courses.listSectionLessons.mockResolvedValue([]);
  enrollments.listMyEnrollments.mockResolvedValue([]);
});

describe('course enrollment on the detail page', () => {
  it('sends guests to sign in and keeps the course in the redirect', async () => {
    const router = renderDetail();

    const link = await screen.findByRole('link', { name: 'Sign in to enroll' });
    fireEvent.click(link);

    await waitFor(() => expect(router.state.location.pathname).toBe('/login'));
    expect(router.state.location.state).toEqual({ from: `/courses/${courseId}` });
    expect(enrollments.listMyEnrollments).not.toHaveBeenCalled();
  });

  it('lets an authenticated student enroll and shows Start learning', async () => {
    setAccessToken('token');
    auth.fetchCurrentUser.mockResolvedValue(student);
    enrollments.enrollInCourse.mockResolvedValue(enrollment('ACTIVE'));

    renderDetail();

    const button = await screen.findByRole('button', { name: 'Enroll' });
    fireEvent.click(button);
    expect((button as HTMLButtonElement).disabled).toBe(true);

    const start = await screen.findByRole('link', { name: 'Start learning' });
    expect(start.getAttribute('href')).toBe(`/courses/${courseId}/learn`);
    expect(enrollments.enrollInCourse).toHaveBeenCalledWith(courseId, 'token');
    expect(enrollments.enrollInCourse).toHaveBeenCalledTimes(1);
    expect((await screen.findByRole('status')).textContent).toBe(ENROLL_SUCCESS_TOAST);
  });

  it('reconciles a duplicate enrollment from the current user list', async () => {
    setAccessToken('token');
    auth.fetchCurrentUser.mockResolvedValue(student);
    enrollments.enrollInCourse.mockRejectedValue(new ApiError(409, 'already enrolled'));
    enrollments.listMyEnrollments
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([enrollment('ACTIVE')]);

    renderDetail();

    fireEvent.click(await screen.findByRole('button', { name: 'Enroll' }));

    expect(await screen.findByRole('link', { name: 'Start learning' })).toBeTruthy();
    expect(enrollments.listMyEnrollments).toHaveBeenCalledTimes(2);
  });

  it('does not treat an unexplained 409 as a successful enrollment', async () => {
    setAccessToken('token');
    auth.fetchCurrentUser.mockResolvedValue(student);
    enrollments.enrollInCourse.mockRejectedValue(new ApiError(409, 'conflict'));
    enrollments.listMyEnrollments.mockResolvedValue([]);

    renderDetail();

    fireEvent.click(await screen.findByRole('button', { name: 'Enroll' }));

    const alert = await screen.findByRole('alert');
    expect(alert.textContent).toMatch(/could not be confirmed/i);
    expect(screen.queryByRole('link', { name: 'Start learning' })).toBeNull();
  });

  it('shows Start learning for an active enrollment', async () => {
    setAccessToken('token');
    auth.fetchCurrentUser.mockResolvedValue(student);
    enrollments.listMyEnrollments.mockResolvedValue([enrollment('ACTIVE')]);

    renderDetail();

    expect(await screen.findByRole('link', { name: 'Start learning' })).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Enroll' })).toBeNull();
  });

  it('shows a completed review state', async () => {
    setAccessToken('token');
    auth.fetchCurrentUser.mockResolvedValue(student);
    enrollments.listMyEnrollments.mockResolvedValue([enrollment('COMPLETED')]);

    renderDetail();

    expect(await screen.findByText('Completed')).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Review course' }).getAttribute('href')).toBe(
      `/courses/${courseId}/learn`,
    );
    expect(screen.queryByRole('link', { name: 'Start learning' })).toBeNull();
  });

  it.each(['PENDING', 'DROPPED'] as const)(
    'does not offer Start learning for %s',
    async (status) => {
      setAccessToken('token');
      auth.fetchCurrentUser.mockResolvedValue(student);
      enrollments.listMyEnrollments.mockResolvedValue([enrollment(status)]);

      renderDetail();

      expect(await screen.findByText(/not available/i)).toBeTruthy();
      expect(screen.queryByRole('link', { name: 'Start learning' })).toBeNull();
      expect(screen.queryByRole('button', { name: 'Enroll' })).toBeNull();
    },
  );
});

describe('my courses', () => {
  it('sends unauthenticated visitors to login and keeps the destination', async () => {
    const router = renderMyCourses();

    expect(await screen.findByRole('heading', { name: 'Sign in' })).toBeTruthy();
    expect(router.state.location.pathname).toBe('/login');
    expect(router.state.location.state).toEqual({ from: '/my-courses' });
  });

  it('shows enrolled courses from the API', async () => {
    setAccessToken('token');
    auth.fetchCurrentUser.mockResolvedValue(student);
    enrollments.listMyEnrollments.mockResolvedValue([
      enrollment('ACTIVE', 'Intro to Algebra'),
      {
        ...enrollment('COMPLETED', 'Geometry'),
        id: 'enroll-completed',
        courseId: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
      },
      {
        ...enrollment('DROPPED', 'Old course'),
        id: 'enroll-dropped',
        courseId: 'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
      },
    ]);

    renderMyCourses();

    expect(await screen.findByRole('heading', { name: 'Intro to Algebra' })).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Geometry' })).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'In progress' })).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Completed' })).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Not currently available' })).toBeTruthy();
    await waitFor(() =>
      expect(screen.getAllByRole('link', { name: 'Bắt đầu học' }).length).toBe(2),
    );
    const learnHrefs = screen
      .getAllByRole('link', { name: 'Bắt đầu học' })
      .map((link) => link.getAttribute('href'));
    expect(learnHrefs).toContain(`/courses/${courseId}/learn`);
    expect(learnHrefs).toContain(
      '/courses/bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb/learn',
    );
    expect(enrollments.listMyEnrollments).toHaveBeenCalledWith('token');
  });

  it('links to the next incomplete lesson when progress is available', async () => {
    setAccessToken('token');
    auth.fetchCurrentUser.mockResolvedValue(student);
    enrollments.listMyEnrollments.mockResolvedValue([enrollment('ACTIVE')]);
    courses.listCourseSections.mockResolvedValue([
      { id: 'sec-1', courseId, title: 'Section', sortOrder: 1 },
    ]);
    courses.listSectionLessons.mockResolvedValue([
      {
        id: 'lesson-1',
        sectionId: 'sec-1',
        courseId,
        title: 'Lesson 1',
        lessonType: 'VIDEO',
        contentUrl: null,
        durationSeconds: null,
        sortOrder: 1,
      },
      {
        id: 'lesson-2',
        sectionId: 'sec-1',
        courseId,
        title: 'Lesson 2',
        lessonType: 'VIDEO',
        contentUrl: null,
        durationSeconds: null,
        sortOrder: 2,
      },
    ]);
    progress.listCourseProgress.mockResolvedValue([
      {
        lessonId: 'lesson-1',
        isCompleted: true,
        watchedDurationSeconds: 60,
        lastAccessedAt: '2026-01-01T00:00:00Z',
      },
    ]);

    renderMyCourses();

    const link = await screen.findByRole('link', { name: 'Tiếp tục học' });
    expect(link.getAttribute('href')).toBe(`/courses/${courseId}/learn/lesson-2`);
  });

  it('shows an empty state', async () => {
    setAccessToken('token');
    auth.fetchCurrentUser.mockResolvedValue(student);
    enrollments.listMyEnrollments.mockResolvedValue([]);

    renderMyCourses();

    expect(await screen.findByText('You are not enrolled in any courses yet')).toBeTruthy();
  });

  it('retries a failed load without exposing server text', async () => {
    setAccessToken('token');
    auth.fetchCurrentUser.mockResolvedValue(student);
    enrollments.listMyEnrollments
      .mockRejectedValueOnce(new ApiError(500, 'org.postgresql secret'))
      .mockResolvedValueOnce([enrollment('ACTIVE')]);

    renderMyCourses();

    const alert = await screen.findByRole('alert');
    expect(alert.textContent).not.toMatch(/postgresql|secret/i);

    fireEvent.click(screen.getByRole('button', { name: 'Try again' }));

    expect(await screen.findByRole('heading', { name: 'Intro to Algebra' })).toBeTruthy();
  });
});
