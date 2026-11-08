import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { useEffect } from 'react';
import { RouterProvider, createMemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../../app/providers/AuthProvider';
import { ToastProvider } from '../../components/feedback/ToastProvider';
import { ApiError } from '../../services/api/api-error';
import { setAccessToken } from '../../services/api/token-storage';
import * as authApi from '../auth/api/auth.api';
import { ProtectedRoute } from '../auth/components/ProtectedRoute';
import type { User } from '../auth/types/auth.types';
import type { Course } from '../catalog/types/course.types';
import type { Lesson } from '../catalog/types/lesson.types';
import type { Section } from '../catalog/types/section.types';
import * as catalogCoursesApi from '../catalog/api/courses.api';
import * as adminLessonsApi from './api/admin-lessons.api';
import * as adminQuizApi from './api/admin-quiz.api';
import * as adminSectionsApi from './api/admin-sections.api';
import { AdminRoute } from './components/AdminRoute';
import { ADMIN_QUIZ_ATTEMPTS_LOCKED_MESSAGE } from './utils/admin-quiz-messages';
import type { QuizAdmin } from './types/admin-quiz.types';
import { AdminQuizBuilderPage } from './pages/AdminQuizBuilderPage';

vi.mock('../auth/api/auth.api', () => ({
  fetchCurrentUser: vi.fn(),
  login: vi.fn(),
  register: vi.fn(),
}));

vi.mock('../catalog/api/courses.api', () => ({
  getCourseById: vi.fn(),
  listCoursesPage: vi.fn(),
  listCourseSections: vi.fn(),
  listSectionLessons: vi.fn(),
}));

vi.mock('./api/admin-sections.api', () => ({
  listCourseSections: vi.fn(),
  createSection: vi.fn(),
  updateSection: vi.fn(),
}));

vi.mock('./api/admin-lessons.api', () => ({
  listSectionLessons: vi.fn(),
  createLesson: vi.fn(),
  updateLesson: vi.fn(),
}));

vi.mock('./api/admin-quiz.api', () => ({
  getQuiz: vi.fn(),
  upsertQuiz: vi.fn(),
}));

const auth = vi.mocked(authApi);
const catalogCourses = vi.mocked(catalogCoursesApi);
const sectionsApi = vi.mocked(adminSectionsApi);
const lessonsApi = vi.mocked(adminLessonsApi);
const quizApi = vi.mocked(adminQuizApi);

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

const course: Course = {
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
  updatedAt: '2026-01-01T00:00:00Z',
};

const section: Section = {
  id: 'sec-1',
  courseId: 'course-1',
  title: 'Phần 1',
  sortOrder: 0,
};

const lessonA: Lesson = {
  id: 'lesson-a',
  sectionId: 'sec-1',
  courseId: 'course-1',
  title: 'Quiz A',
  lessonType: 'QUIZ',
  contentUrl: null,
  durationSeconds: null,
  sortOrder: 0,
};

const lessonB: Lesson = {
  id: 'lesson-b',
  sectionId: 'sec-1',
  courseId: 'course-1',
  title: 'Quiz B',
  lessonType: 'QUIZ',
  contentUrl: null,
  durationSeconds: null,
  sortOrder: 1,
};

function makeQuiz(lessonId: string): QuizAdmin {
  return {
    quizId: `quiz-${lessonId}`,
    lessonId,
    courseId: 'course-1',
    passingScore: 80,
    timeLimitMinutes: null,
    maxAttempts: null,
    finalAssessment: false,
    questions: [
      {
        id: `q-${lessonId}`,
        questionText: `Câu hỏi ${lessonId}?`,
        questionType: 'SINGLE_CHOICE',
        scoreWeight: 1,
        options: [
          { id: `o1-${lessonId}`, optionText: 'Đúng', isCorrect: true },
          { id: `o2-${lessonId}`, optionText: 'Sai', isCorrect: false },
        ],
      },
    ],
  };
}

let pageInstanceCount = 0;

function AdminQuizBuilderPageTracked() {
  useEffect(() => {
    pageInstanceCount += 1;
  }, []);
  return <AdminQuizBuilderPage />;
}

function renderQuizBuilder(initialLessonId: string) {
  pageInstanceCount = 0;
  const router = createMemoryRouter(
    [
      {
        element: <ProtectedRoute />,
        children: [
          {
            element: <AdminRoute />,
            children: [
              {
                path: '/admin/courses/:courseId/lessons/:lessonId/quiz',
                element: <AdminQuizBuilderPageTracked />,
              },
            ],
          },
        ],
      },
    ],
    {
      initialEntries: [`/admin/courses/course-1/lessons/${initialLessonId}/quiz`],
    },
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

function setupCurriculumMocks() {
  catalogCourses.getCourseById.mockResolvedValue(course);
  sectionsApi.listCourseSections.mockResolvedValue([section]);
  lessonsApi.listSectionLessons.mockResolvedValue([lessonA, lessonB]);
  quizApi.getQuiz.mockImplementation((_token, _courseId, lessonId) =>
    Promise.resolve(makeQuiz(lessonId)),
  );
}

beforeEach(() => {
  sessionStorage.clear();
  setAccessToken('admin-token');
  auth.fetchCurrentUser.mockResolvedValue(admin);
  setupCurriculumMocks();
  quizApi.upsertQuiz.mockReset();
});

describe('AdminQuizBuilderPage route state', () => {
  it('clears question-lock state when navigating to another lesson without remounting', async () => {
    quizApi.upsertQuiz.mockImplementation((_token, _courseId, lessonId) => {
      if (lessonId === 'lesson-a') {
        return Promise.reject(new ApiError(409, 'Conflict'));
      }
      return Promise.resolve(makeQuiz(lessonId));
    });

    const router = renderQuizBuilder('lesson-a');

    expect(await screen.findByRole('heading', { name: /Cấu hình quiz: Quiz A/ })).toBeTruthy();
    expect(pageInstanceCount).toBe(1);

    fireEvent.click(await screen.findByRole('button', { name: 'Lưu quiz' }));

    expect(await screen.findByText(ADMIN_QUIZ_ATTEMPTS_LOCKED_MESSAGE)).toBeTruthy();
    expect(screen.queryByRole('heading', { name: 'Câu hỏi' })).toBeNull();

    await router.navigate('/admin/courses/course-1/lessons/lesson-b/quiz');

    expect(await screen.findByRole('heading', { name: /Cấu hình quiz: Quiz B/ })).toBeTruthy();
    expect(pageInstanceCount).toBe(1);
    await waitFor(() => {
      expect(screen.queryByText(ADMIN_QUIZ_ATTEMPTS_LOCKED_MESSAGE)).toBeNull();
    });
    expect(screen.getByRole('heading', { name: 'Câu hỏi' })).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: 'Lưu quiz' }));

    await waitFor(() => expect(quizApi.upsertQuiz).toHaveBeenCalled());
    const lessonBCall = quizApi.upsertQuiz.mock.calls.find((call) => call[2] === 'lesson-b');
    expect(lessonBCall).toBeTruthy();
    const lessonBPayload = lessonBCall![3];
    expect(lessonBPayload.questions).toBeDefined();
    expect(lessonBPayload.questions?.length).toBeGreaterThan(0);
  });

  it('omits questions on save when the current lesson is genuinely locked', async () => {
    quizApi.upsertQuiz.mockImplementation((_token, _courseId, lessonId, payload) => {
      if (lessonId === 'lesson-a' && payload.questions !== undefined) {
        return Promise.reject(new ApiError(409, 'Conflict'));
      }
      return Promise.resolve(makeQuiz(lessonId));
    });

    renderQuizBuilder('lesson-a');

    expect(await screen.findByRole('button', { name: 'Lưu quiz' })).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: 'Lưu quiz' }));
    expect(await screen.findByText(ADMIN_QUIZ_ATTEMPTS_LOCKED_MESSAGE)).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: 'Lưu quiz' }));

    await waitFor(() => expect(quizApi.upsertQuiz.mock.calls.length).toBeGreaterThanOrEqual(2));
    const lockedSaveCall = quizApi.upsertQuiz.mock.calls.at(-1);
    expect(lockedSaveCall?.[2]).toBe('lesson-a');
    expect(lockedSaveCall?.[3].questions).toBeUndefined();
  });
});
