import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { RouterProvider, createMemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../../app/providers/AuthProvider';
import { ToastProvider } from '../../components/feedback/ToastProvider';
import { AppShell } from '../../components/layout/AppShell';
import { ApiError } from '../../services/api/api-error';
import * as coursesApi from './api/courses.api';
import { CatalogPage } from './pages/CatalogPage';
import { CourseDetailPage } from './pages/CourseDetailPage';
import type { Course } from './types/course.types';
import type { Lesson } from './types/lesson.types';
import type { Section } from './types/section.types';

vi.mock('./api/courses.api', () => ({
  listPublishedCourses: vi.fn(),
  getCourseById: vi.fn(),
  listCourseSections: vi.fn(),
  listSectionLessons: vi.fn(),
}));

const api = vi.mocked(coursesApi);

const courseId = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const sectionId = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';

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

const section: Section = {
  id: sectionId,
  courseId,
  title: 'Getting started',
  sortOrder: 0,
};

const lesson: Lesson = {
  id: 'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
  sectionId,
  courseId,
  title: 'What is algebra?',
  lessonType: 'VIDEO',
  contentUrl: 'https://example.com/video',
  durationSeconds: 300,
  sortOrder: 0,
};

function renderRoutes(initialEntry: string) {
  const router = createMemoryRouter(
    [
      {
        path: '/',
        element: <AppShell />,
        children: [
          { path: 'courses', element: <CatalogPage /> },
          { path: 'courses/:courseId', element: <CourseDetailPage /> },
        ],
      },
    ],
    { initialEntries: [initialEntry] },
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
  api.listPublishedCourses.mockReset();
  api.listPublishedCourses.mockResolvedValue([]);
  api.getCourseById.mockReset();
  api.listCourseSections.mockReset();
  api.listSectionLessons.mockReset();
});

describe('course detail navigation', () => {
  it('navigates from a catalog card to the detail URL', async () => {
    api.listPublishedCourses.mockResolvedValue([course]);

    const router = renderRoutes('/courses');
    const link = await screen.findByRole('link', { name: /Intro to Algebra/ });
    expect(link.getAttribute('href')).toBe(`/courses/${courseId}`);

    api.getCourseById.mockResolvedValue(course);
    api.listCourseSections.mockResolvedValue([]);
    fireEvent.click(link);

    await waitFor(() => expect(router.state.location.pathname).toBe(`/courses/${courseId}`));
  });
});

describe('course detail page', () => {
  it('renders course information and curriculum from the API', async () => {
    api.getCourseById.mockResolvedValue(course);
    api.listCourseSections.mockResolvedValue([section]);
    api.listSectionLessons.mockResolvedValue([lesson]);

    renderRoutes(`/courses/${courseId}`);

    expect(await screen.findByRole('heading', { name: 'Intro to Algebra' })).toBeTruthy();
    expect(screen.getAllByText('Equations and graphs.').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Miễn phí').length).toBeGreaterThanOrEqual(1);
    const sectionToggle = await screen.findByRole('button', { name: /Getting started/ });
    expect(sectionToggle.getAttribute('aria-expanded')).toBe('true');
    expect(sectionToggle.textContent).toMatch(/1 bài học/);
    expect(await screen.findByText('What is algebra?')).toBeTruthy();
    expect(screen.queryByText(lesson.contentUrl ?? '')).toBeNull();
    expect(await screen.findByText(/Video • 5 min/)).toBeTruthy();
    expect(document.querySelector('.course-detail-curriculum-sections')).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Nội dung khóa học' })).toBeTruthy();
    expect(
      screen.getByRole('navigation', { name: 'Breadcrumb' }).querySelector('a[href="/courses"]'),
    ).toBeTruthy();
    expect(api.getCourseById).toHaveBeenCalledWith(courseId, null);
  });

  it('shows a not-found state for unpublished or missing courses', async () => {
    api.getCourseById.mockRejectedValue(new ApiError(404, 'Course not found'));

    renderRoutes(`/courses/${courseId}`);

    expect(await screen.findByRole('heading', { name: 'Course not available' })).toBeTruthy();
    expect(screen.getByText(/unpublished/i)).toBeTruthy();
    expect(api.listCourseSections).not.toHaveBeenCalled();
  });

  it('retries a failed course load without exposing server text', async () => {
    api.getCourseById
      .mockRejectedValueOnce(new ApiError(500, 'org.postgresql secret'))
      .mockResolvedValueOnce(course);
    api.listCourseSections.mockResolvedValue([]);
    api.listSectionLessons.mockResolvedValue([]);

    renderRoutes(`/courses/${courseId}`);

    const alert = await screen.findByRole('alert');
    expect(alert.textContent).not.toMatch(/postgresql|secret/i);

    fireEvent.click(screen.getByRole('button', { name: 'Try again' }));

    expect(await screen.findByRole('heading', { name: 'Intro to Algebra' })).toBeTruthy();
  });

  it('keeps the overview when curriculum loading fails', async () => {
    api.getCourseById.mockResolvedValue(course);
    api.listCourseSections.mockRejectedValue(new ApiError(500, 'sections down'));

    renderRoutes(`/courses/${courseId}`);

    expect(await screen.findByRole('heading', { name: 'Intro to Algebra' })).toBeTruthy();
    const alert = await screen.findByRole('alert');
    expect(alert.textContent).not.toMatch(/sections down/);
    expect(screen.getByRole('heading', { name: 'Nội dung khóa học' })).toBeTruthy();
  });

  it('shows an empty curriculum state', async () => {
    api.getCourseById.mockResolvedValue(course);
    api.listCourseSections.mockResolvedValue([]);

    renderRoutes(`/courses/${courseId}`);

    expect(await screen.findByText('Khóa học chưa có chương nào.')).toBeTruthy();
  });

  it('expands and collapses curriculum sections independently', async () => {
    const secondSection: Section = {
      id: 'dddddddd-dddd-4ddd-8ddd-dddddddddddd',
      courseId,
      title: 'Practice',
      sortOrder: 1,
    };
    api.getCourseById.mockResolvedValue(course);
    api.listCourseSections.mockResolvedValue([section, secondSection]);
    api.listSectionLessons.mockImplementation(async (_courseId, id) =>
      id === section.id ? [lesson] : [],
    );

    renderRoutes(`/courses/${courseId}`);

    const basics = await screen.findByRole('button', { name: /Getting started/ });
    const practice = await screen.findByRole('button', { name: /Practice/ });
    expect(await screen.findByText('What is algebra?')).toBeTruthy();
    expect(practice.textContent).toMatch(/0 bài học/);

    fireEvent.click(basics);

    expect(basics.getAttribute('aria-expanded')).toBe('false');
    expect(screen.queryByText('What is algebra?')).toBeNull();
    expect(practice.getAttribute('aria-expanded')).toBe('true');
    expect(screen.getByText('Chưa có bài học trong phần này.')).toBeTruthy();

    fireEvent.click(basics);
    expect(basics.getAttribute('aria-expanded')).toBe('true');
    expect(screen.getByText('What is algebra?')).toBeTruthy();
  });

  it('shows when a section has no lessons', async () => {
    api.getCourseById.mockResolvedValue(course);
    api.listCourseSections.mockResolvedValue([section]);
    api.listSectionLessons.mockResolvedValue([]);

    renderRoutes(`/courses/${courseId}`);

    expect(await screen.findByText('Chưa có bài học trong phần này.')).toBeTruthy();
  });
});
