import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { RouterProvider, createMemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../../app/providers/AuthProvider';
import { AppShell } from '../../components/layout/AppShell';
import { ApiError } from '../../services/api/api-error';
import { setAccessToken } from '../../services/api/token-storage';
import * as authApi from '../auth/api/auth.api';
import { ProtectedRoute } from '../auth/components/ProtectedRoute';
import { LoginPage } from '../auth/pages/LoginPage';
import type { User } from '../auth/types/auth.types';
import * as coursesApi from '../catalog/api/courses.api';
import type { Course } from '../catalog/types/course.types';
import type { Lesson } from '../catalog/types/lesson.types';
import type { Section } from '../catalog/types/section.types';
import * as lessonsApi from './api/lessons.api';
import * as progressApi from './api/progress.api';
import { LearningWorkspacePage } from './pages/LearningWorkspacePage';

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

vi.mock('./api/lessons.api', () => ({
  getLessonContent: vi.fn(),
}));

vi.mock('./api/progress.api', () => ({
  listCourseProgress: vi.fn(),
  getLessonProgress: vi.fn(),
  completeLessonProgress: vi.fn(),
}));

const auth = vi.mocked(authApi);
const courses = vi.mocked(coursesApi);
const lessons = vi.mocked(lessonsApi);
const progress = vi.mocked(progressApi);

const courseId = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const sectionA = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
const sectionB = 'cccccccc-cccc-4ccc-8ccc-cccccccccccc';
const lessonA = 'dddddddd-dddd-4ddd-8ddd-dddddddddddd';
const lessonB = 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee';

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

const sections: Section[] = [
  { id: sectionA, courseId, title: 'Basics', sortOrder: 0 },
  { id: sectionB, courseId, title: 'Practice', sortOrder: 1 },
];

function lesson(id: string, sectionId: string, title: string, contentUrl: string | null): Lesson {
  return {
    id,
    sectionId,
    courseId,
    title,
    lessonType: 'VIDEO',
    contentUrl,
    durationSeconds: 60,
    sortOrder: 0,
  };
}

const summaryA = lesson(lessonA, sectionA, 'What is algebra?', 'https://summary.example/hidden.mp4');
const summaryB = lesson(lessonB, sectionB, 'Practice problems', 'https://summary.example/hidden-2.mp4');
const protectedA = lesson(lessonA, sectionA, 'What is algebra?', 'https://cdn.example/algebra.mp4');
const protectedB = lesson(lessonB, sectionB, 'Practice problems', 'https://cdn.example/practice.mp4');

function articleLesson(
  id: string,
  sectionId: string,
  title: string,
  contentUrl: string | null,
): Lesson {
  return { ...lesson(id, sectionId, title, contentUrl), lessonType: 'ARTICLE' };
}

function renderWorkspace(path = `/courses/${courseId}/learn`) {
  const router = createMemoryRouter(
    [
      {
        path: '/',
        element: <AppShell />,
        children: [
          {
            element: <ProtectedRoute />,
            children: [
              { path: 'courses/:courseId/learn/:lessonId?', element: <LearningWorkspacePage /> },
            ],
          },
        ],
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
  courses.getCourseById.mockReset();
  courses.listCourseSections.mockReset();
  courses.listSectionLessons.mockReset();
  courses.listPublishedCourses.mockReset();
  lessons.getLessonContent.mockReset();
  progress.listCourseProgress.mockReset();
  progress.completeLessonProgress.mockReset();
  progress.listCourseProgress.mockResolvedValue([]);
  courses.getCourseById.mockResolvedValue(course);
  courses.listPublishedCourses.mockResolvedValue([]);
  courses.listCourseSections.mockResolvedValue(sections);
  courses.listSectionLessons.mockImplementation(async (_courseId, sectionId) => {
    if (sectionId === sectionA) {
      return [summaryA];
    }
    if (sectionId === sectionB) {
      return [summaryB];
    }
    return [];
  });
  lessons.getLessonContent.mockImplementation(async (_courseId, _sectionId, lessonId) => {
    if (lessonId === lessonB) {
      return protectedB;
    }
    return protectedA;
  });
});

describe('learning workspace curriculum', () => {
  it('shows the shared app header and footer', async () => {
    setAccessToken('token');
    auth.fetchCurrentUser.mockResolvedValue(student);

    renderWorkspace();

    expect(await screen.findByRole('navigation', { name: 'Main' })).toBeTruthy();
    expect(screen.getByRole('navigation', { name: 'Footer' })).toBeTruthy();
    expect(screen.getByRole('link', { name: 'LMS' })).toBeTruthy();
  });

  it('loads protected lesson content and ignores summary playback URLs', async () => {
    setAccessToken('token');
    auth.fetchCurrentUser.mockResolvedValue(student);

    renderWorkspace();

    expect(await screen.findByRole('heading', { name: 'What is algebra?' })).toBeTruthy();
    const video = document.querySelector('video');
    expect(video?.getAttribute('src')).toBe('https://cdn.example/algebra.mp4');
    expect(video?.getAttribute('src')).not.toBe(summaryA.contentUrl);
    expect(lessons.getLessonContent).toHaveBeenCalledWith(courseId, sectionA, lessonA, 'token');
    expect(screen.getByRole('main', { name: 'Lesson' })).toBeTruthy();
    const sidebarScroll = document.querySelector('.learning-sidebar-scroll');
    const stage = document.querySelector('.learning-stage');
    expect(sidebarScroll).toBeTruthy();
    expect(stage).toBeTruthy();
    expect(sidebarScroll).not.toBe(stage);
  });

  it('expands and collapses the sidebar without changing the lesson or refetching it', async () => {
    setAccessToken('token');
    auth.fetchCurrentUser.mockResolvedValue(student);
    const router = renderWorkspace();

    expect(await screen.findByRole('heading', { name: 'What is algebra?' })).toBeTruthy();
    expect(lessons.getLessonContent).toHaveBeenCalledTimes(1);
    const stage = screen.getByRole('main', { name: 'Lesson' });

    fireEvent.click(screen.getByRole('button', { name: 'Collapse curriculum' }));

    expect(screen.getByRole('button', { name: 'Expand curriculum' }).getAttribute('aria-expanded')).toBe(
      'false',
    );
    expect(screen.queryByRole('button', { name: 'Basics' })).toBeNull();
    expect(screen.getByRole('heading', { name: 'What is algebra?' })).toBeTruthy();
    expect(screen.getByRole('main', { name: 'Lesson' })).toBe(stage);
    expect(lessons.getLessonContent).toHaveBeenCalledTimes(1);
    expect(router.state.location.pathname).toBe(`/courses/${courseId}/learn`);

    fireEvent.click(screen.getByRole('button', { name: 'Expand curriculum' }));

    expect(
      screen.getByRole('button', { name: 'Collapse curriculum' }).getAttribute('aria-expanded'),
    ).toBe('true');
    expect(screen.getByRole('main', { name: 'Lesson' })).toBe(stage);
    expect(screen.getByRole('link', { name: 'What is algebra?' }).getAttribute('aria-current')).toBe(
      'page',
    );
    expect(lessons.getLessonContent).toHaveBeenCalledTimes(1);
  });

  it('collapses sections independently and opens a section when navigation selects its lesson', async () => {
    setAccessToken('token');
    auth.fetchCurrentUser.mockResolvedValue(student);
    const router = renderWorkspace();

    expect(await screen.findByRole('link', { name: 'Practice problems' })).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: /Practice/ }));
    expect(screen.getByRole('button', { name: /Practice/ }).getAttribute('aria-expanded')).toBe(
      'false',
    );
    expect(screen.queryByRole('link', { name: 'Practice problems' })).toBeNull();
    expect(screen.getByRole('link', { name: 'What is algebra?' })).toBeTruthy();
    expect(screen.getByRole('button', { name: /Basics/ }).getAttribute('aria-expanded')).toBe('true');

    fireEvent.click(screen.getByRole('link', { name: 'Next lesson' }));

    await waitFor(() =>
      expect(router.state.location.pathname).toBe(`/courses/${courseId}/learn/${lessonB}`),
    );
    expect(screen.getByRole('button', { name: /Practice/ }).getAttribute('aria-expanded')).toBe(
      'true',
    );
    expect(await screen.findByRole('heading', { name: 'Practice problems' })).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Practice problems' }).getAttribute('aria-current')).toBe(
      'page',
    );
    expect(document.querySelector('video')?.getAttribute('src')).toBe(
      'https://cdn.example/practice.mp4',
    );
    expect(lessons.getLessonContent).toHaveBeenLastCalledWith(courseId, sectionB, lessonB, 'token');
  });

  it('keeps the previous lesson when its section is collapsed and expanded again', async () => {
    setAccessToken('token');
    auth.fetchCurrentUser.mockResolvedValue(student);

    renderWorkspace();

    expect(await screen.findByRole('heading', { name: 'What is algebra?' })).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: /Basics/ }));
    expect(screen.queryByRole('link', { name: 'What is algebra?' })).toBeNull();
    expect(screen.getByRole('heading', { name: 'What is algebra?' })).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: /Basics/ }));
    expect(screen.getByRole('link', { name: 'What is algebra?' }).getAttribute('aria-current')).toBe(
      'page',
    );
  });

  it('embeds supported YouTube URLs in a privacy-enhanced iframe', async () => {
    setAccessToken('token');
    auth.fetchCurrentUser.mockResolvedValue(student);
    const youtubeUrl = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
    lessons.getLessonContent.mockResolvedValue(
      lesson(lessonA, sectionA, 'What is algebra?', youtubeUrl),
    );

    renderWorkspace();

    expect(await screen.findByRole('heading', { name: 'What is algebra?' })).toBeTruthy();
    expect(document.querySelector('video')).toBeNull();
    const iframe = document.querySelector('iframe');
    expect(iframe?.getAttribute('src')).toBe('https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ');
    expect(screen.queryByRole('link', { name: /youtube/i })).toBeNull();
  });

  it('shows Google Docs preview with an external link fallback', async () => {
    setAccessToken('token');
    auth.fetchCurrentUser.mockResolvedValue(student);
    const docUrl = 'https://docs.google.com/document/d/docId9AbC/edit';
    const docLesson = articleLesson(lessonA, sectionA, 'Reading handout', docUrl);
    lessons.getLessonContent.mockResolvedValue(docLesson);
    courses.listSectionLessons.mockImplementation(async (_courseId, sectionId) => {
      if (sectionId === sectionA) {
        return [{ ...docLesson, contentUrl: null }];
      }
      return [];
    });

    renderWorkspace();

    expect(await screen.findByRole('heading', { name: 'Reading handout' })).toBeTruthy();
    const iframe = document.querySelector('iframe');
    expect(iframe?.getAttribute('src')).toBe('https://docs.google.com/document/d/docId9AbC/preview');
    const link = screen.getByRole('link', { name: 'Open in Google Docs' });
    expect(link.getAttribute('href')).toBe(docUrl);
    expect(link.closest('.learning-external-fallback-secondary')).toBeTruthy();
    expect(screen.getByText(/may not work for every file type/i)).toBeTruthy();
  });

  it('auto-completes a video lesson after protected content loads and updates sidebar progress', async () => {
    setAccessToken('token');
    auth.fetchCurrentUser.mockResolvedValue(student);
    progress.completeLessonProgress.mockResolvedValue({
      lessonId: lessonA,
      isCompleted: true,
      watchedDurationSeconds: 0,
      lastAccessedAt: '2026-02-01T00:00:00Z',
    });

    renderWorkspace();

    expect(await screen.findByRole('heading', { name: 'What is algebra?' })).toBeTruthy();
    expect(screen.getByText('Not completed')).toBeTruthy();
    expect(screen.getByRole('progressbar').getAttribute('aria-valuenow')).toBe('0');
    expect(progress.completeLessonProgress).not.toHaveBeenCalled();

    const video = document.querySelector('video');
    expect(video).toBeTruthy();
    fireEvent.loadedData(video!);

    await waitFor(() => expect(screen.getByText('Completed')).toBeTruthy());
    expect(progress.completeLessonProgress).toHaveBeenCalledTimes(1);
    expect(progress.completeLessonProgress).toHaveBeenCalledWith(courseId, lessonA, 'token');
    expect(screen.getByRole('progressbar').getAttribute('aria-valuenow')).toBe('50');
    expect(screen.getByText('1 of 2 lessons completed')).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Mark as complete' })).toBeNull();

    fireEvent.loadedData(video!);
    expect(progress.completeLessonProgress).toHaveBeenCalledTimes(1);
  });

  it('does not auto-complete before protected lesson content is loaded', async () => {
    setAccessToken('token');
    auth.fetchCurrentUser.mockResolvedValue(student);

    renderWorkspace();

    expect(await screen.findByRole('heading', { name: 'What is algebra?' })).toBeTruthy();
    expect(progress.completeLessonProgress).not.toHaveBeenCalled();
  });

  it('does not play a summary URL when content access is denied', async () => {
    setAccessToken('token');
    auth.fetchCurrentUser.mockResolvedValue(student);
    lessons.getLessonContent.mockRejectedValue(
      new ApiError(403, 'Enrollment required to access lesson content'),
    );

    renderWorkspace();

    const alert = await screen.findByRole('alert');
    expect(alert.textContent).toMatch(/active enrollment/i);
    expect(alert.textContent).not.toMatch(/summary\.example/);
    expect(document.querySelector('video')).toBeNull();
  });
});
