import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { RouterProvider, createMemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../../app/providers/AuthProvider';
import { ToastProvider } from '../../components/feedback/ToastProvider';
import { ApiError } from '../../services/api/api-error';
import { setAccessToken } from '../../services/api/token-storage';
import * as authApi from '../auth/api/auth.api';
import { ProtectedRoute } from '../auth/components/ProtectedRoute';
import type { User } from '../auth/types/auth.types';
import * as adminLessonsApi from './api/admin-lessons.api';
import * as adminQuizApi from './api/admin-quiz.api';
import * as adminSectionsApi from './api/admin-sections.api';
import * as catalogCoursesApi from '../catalog/api/courses.api';
import type { Course } from '../catalog/types/course.types';
import type { Lesson } from '../catalog/types/lesson.types';
import type { Section } from '../catalog/types/section.types';
import { AdminRoute } from './components/AdminRoute';
import { AdminCurriculumPage } from './pages/AdminCurriculumPage';

vi.mock('../auth/api/auth.api', () => ({
  fetchCurrentUser: vi.fn(),
  login: vi.fn(),
  register: vi.fn(),
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

vi.mock('../catalog/api/courses.api', () => ({
  getCourseById: vi.fn(),
  listPublishedCourses: vi.fn(),
  listCourseSections: vi.fn(),
  listSectionLessons: vi.fn(),
}));

vi.mock('./api/admin-quiz.api', () => ({
  getQuiz: vi.fn(),
}));

const auth = vi.mocked(authApi);
const sectionsApi = vi.mocked(adminSectionsApi);
const lessonsApi = vi.mocked(adminLessonsApi);
const catalogCourses = vi.mocked(catalogCoursesApi);
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
  price: 0,
  published: true,
  finalQuizId: null,
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
};

const sectionA: Section = {
  id: 'sec-2',
  courseId: 'course-1',
  title: 'Chương B',
  sortOrder: 2,
};

const sectionB: Section = {
  id: 'sec-1',
  courseId: 'course-1',
  title: 'Chương A',
  sortOrder: 1,
};

const lesson: Lesson = {
  id: 'lesson-1',
  sectionId: 'sec-1',
  courseId: 'course-1',
  title: 'Bài mở đầu',
  lessonType: 'VIDEO',
  contentUrl: null,
  durationSeconds: 120,
  sortOrder: 1,
};

function renderCurriculum() {
  const router = createMemoryRouter(
    [
      {
        element: <ProtectedRoute />,
        children: [
          {
            element: <AdminRoute />,
            children: [
              {
                path: '/admin/courses/:courseId/curriculum',
                element: <AdminCurriculumPage />,
              },
            ],
          },
        ],
      },
    ],
    { initialEntries: ['/admin/courses/course-1/curriculum'] },
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
  sectionsApi.listCourseSections.mockReset();
  sectionsApi.createSection.mockReset();
  sectionsApi.updateSection.mockReset();
  lessonsApi.listSectionLessons.mockReset();
  lessonsApi.createLesson.mockReset();
  lessonsApi.updateLesson.mockReset();
  catalogCourses.getCourseById.mockReset();
  quizApi.getQuiz.mockReset();
  quizApi.getQuiz.mockRejectedValue(new ApiError(404, 'Not found'));
  sectionsApi.listCourseSections.mockResolvedValue([]);
  lessonsApi.listSectionLessons.mockResolvedValue([]);
  setAccessToken('admin-token');
  auth.fetchCurrentUser.mockResolvedValue(admin);
  catalogCourses.getCourseById.mockResolvedValue(course);
});

describe('AdminCurriculumPage', () => {
  it('loads course title and renders sections ordered by sortOrder', async () => {
    sectionsApi.listCourseSections.mockResolvedValue([sectionA, sectionB]);
    lessonsApi.listSectionLessons.mockImplementation(async (_token, _courseId, sectionId) => {
      if (sectionId === 'sec-1') {
        return [lesson];
      }
      return [];
    });

    renderCurriculum();

    expect(await screen.findByText(/Chương trình: HSK 1/)).toBeTruthy();
    await screen.findByRole('heading', { name: 'Chương A' });
    const headings = screen.getAllByRole('heading', { level: 2 });
    const sectionTitles = headings
      .map((node) => node.textContent)
      .filter((text) => text?.startsWith('Chương'));
    expect(sectionTitles).toEqual(['Chương A', 'Chương B']);
    expect(screen.getByText('Bài mở đầu')).toBeTruthy();
  });

  it('creates a section and refreshes the list', async () => {
    const created: Section = {
      id: 'sec-new',
      courseId: 'course-1',
      title: 'Chương A',
      sortOrder: 1,
    };
    sectionsApi.listCourseSections.mockResolvedValueOnce([]).mockResolvedValueOnce([created]);
    sectionsApi.createSection.mockResolvedValue(created);

    renderCurriculum();
    await screen.findByText('Chưa có chương nào');

    fireEvent.click(screen.getByRole('button', { name: '+ Thêm chương' }));
    fireEvent.change(screen.getByLabelText(/^Tiêu đề chương/), {
      target: { value: 'Chương A' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Tạo chương' }));

    await waitFor(() =>
      expect(sectionsApi.createSection).toHaveBeenCalledWith('admin-token', 'course-1', {
        title: 'Chương A',
        sortOrder: undefined,
      }),
    );
    expect(await screen.findByRole('heading', { name: 'Chương A' })).toBeTruthy();
  });

  it('shows validation errors when creating a lesson with invalid duration', async () => {
    sectionsApi.listCourseSections.mockResolvedValue([sectionB]);
    lessonsApi.listSectionLessons.mockResolvedValue([]);

    renderCurriculum();
    await screen.findByRole('heading', { name: 'Chương A' });

    fireEvent.click(screen.getByRole('button', { name: '+ Thêm bài học' }));
    fireEvent.change(screen.getByLabelText(/^Tiêu đề bài học/), {
      target: { value: 'Quiz intro' },
    });
    fireEvent.change(screen.getByLabelText(/^Thời lượng/), { target: { value: '-5' } });
    fireEvent.click(screen.getByRole('button', { name: 'Thêm bài học' }));

    expect(await screen.findByText(/Thời lượng phải ≥ 0/)).toBeTruthy();
    expect(lessonsApi.createLesson).not.toHaveBeenCalled();
  });

  it('shows quiz configuration status and link for QUIZ lessons', async () => {
    const quizLesson: Lesson = {
      ...lesson,
      id: 'lesson-quiz',
      title: 'Bài kiểm tra',
      lessonType: 'QUIZ',
    };
    sectionsApi.listCourseSections.mockResolvedValue([sectionB]);
    lessonsApi.listSectionLessons.mockResolvedValue([quizLesson]);
    quizApi.getQuiz.mockResolvedValue({
      quizId: 'quiz-1',
      lessonId: 'lesson-quiz',
      courseId: 'course-1',
      passingScore: 80,
      timeLimitMinutes: null,
      maxAttempts: null,
      finalAssessment: false,
      questions: [],
    });

    renderCurriculum();
    await screen.findByRole('heading', { name: 'Chương A' });

    expect(await screen.findByText('Đã cấu hình quiz')).toBeTruthy();
    const quizLink = screen.getByRole('link', { name: 'Cấu hình quiz' }) as HTMLAnchorElement;
    expect(quizLink.getAttribute('href')).toBe(
      '/admin/courses/course-1/lessons/lesson-quiz/quiz',
    );
    expect(quizApi.getQuiz).toHaveBeenCalledWith('admin-token', 'course-1', 'lesson-quiz');
  });

  it('preserves lesson form values when the API fails', async () => {
    sectionsApi.listCourseSections.mockResolvedValue([sectionB]);
    lessonsApi.listSectionLessons.mockResolvedValue([]);
    lessonsApi.createLesson.mockRejectedValue(new ApiError(400, 'Invalid lesson'));

    renderCurriculum();
    await screen.findByRole('heading', { name: 'Chương A' });

    fireEvent.click(screen.getByRole('button', { name: '+ Thêm bài học' }));
    fireEvent.change(screen.getByLabelText(/^Tiêu đề bài học/), {
      target: { value: 'Bài mới' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Thêm bài học' }));

    const alerts = await screen.findAllByRole('alert');
    expect(alerts.some((node) => node.textContent?.includes('Invalid lesson'))).toBe(true);
    expect((screen.getByLabelText(/^Tiêu đề bài học/) as HTMLInputElement).value).toBe(
      'Bài mới',
    );
  });
});
