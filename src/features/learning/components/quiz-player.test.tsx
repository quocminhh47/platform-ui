import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { AuthProvider } from '../../../app/providers/AuthProvider';
import { ApiError } from '../../../services/api/api-error';
import { setAccessToken } from '../../../services/api/token-storage';
import * as authApi from '../../auth/api/auth.api';
import type { User } from '../../auth/types/auth.types';
import * as quizApi from '../api/quiz-attempts.api';
import type { QuizAttemptResultResponse, QuizAttemptTakeResponse } from '../types/quiz.types';
import { QuizPlayer } from './QuizPlayer';

vi.mock('../../auth/api/auth.api', () => ({
  fetchCurrentUser: vi.fn(),
  login: vi.fn(),
  register: vi.fn(),
}));

vi.mock('../api/quiz-attempts.api', () => ({
  getQuizSession: vi.fn(),
  startOrResumeQuizAttempt: vi.fn(),
  submitQuizAttempt: vi.fn(),
  getCurrentQuizAttempt: vi.fn(),
  getQuizAttempt: vi.fn(),
}));

const auth = vi.mocked(authApi);
const quiz = vi.mocked(quizApi);

const student: User = {
  id: 'u1',
  email: 'student@example.com',
  fullName: 'Học viên',
  role: 'STUDENT',
  avatarUrl: null,
  active: true,
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
};

const take: QuizAttemptTakeResponse = {
  attemptId: 'attempt-1',
  quizId: 'quiz-1',
  lessonId: 'lesson-1',
  status: 'IN_PROGRESS',
  startedAt: '2026-01-01T00:00:00Z',
  expiresAt: null,
  serverNow: '2026-01-01T00:00:00Z',
  timeLimitMinutes: null,
  passingScore: 80,
  maxAttempts: null,
  attemptsUsed: 1,
  finalAssessment: false,
  questions: [
    {
      id: 'q1',
      questionText: 'Chọn một',
      questionType: 'SINGLE_CHOICE',
      options: [
        { id: 'o1', optionText: 'Đáp án A' },
        { id: 'o2', optionText: 'Đáp án B' },
      ],
    },
  ],
};

const result: QuizAttemptResultResponse = {
  attemptId: 'attempt-1',
  quizId: 'quiz-1',
  lessonId: 'lesson-1',
  status: 'SUBMITTED',
  score: 100,
  passed: true,
  passingScore: 80,
  startedAt: '2026-01-01T00:00:00Z',
  submittedAt: '2026-01-01T00:01:00Z',
  finalAssessment: false,
  bestScore: 100,
  bestPassed: true,
  maxAttempts: null,
  attemptsUsed: 1,
  answers: [{ questionId: 'q1', selectedOptionIds: ['o1'] }],
  questions: take.questions,
};

function renderPlayer() {
  return render(
    <AuthProvider>
      <QuizPlayer courseId="course-1" lessonId="lesson-1" />
    </AuthProvider>,
  );
}

describe('QuizPlayer', () => {
  beforeEach(() => {
    quiz.getQuizSession.mockReset();
    quiz.startOrResumeQuizAttempt.mockReset();
    quiz.submitQuizAttempt.mockReset();
  });

  it('renders questions and submits answers', async () => {
    setAccessToken('token');
    auth.fetchCurrentUser.mockResolvedValue(student);
    quiz.getQuizSession.mockResolvedValue(take);
    quiz.submitQuizAttempt.mockResolvedValue(result);

    renderPlayer();

    expect(await screen.findByText(/Câu 1\. Chọn một/)).toBeTruthy();
    expect(screen.getByText('Đáp án A')).toBeTruthy();
    expect(screen.queryByText(/isCorrect/i)).toBeNull();
    expect(quiz.startOrResumeQuizAttempt).not.toHaveBeenCalled();

    fireEvent.click(screen.getByLabelText('Đáp án A'));
    fireEvent.click(screen.getByRole('button', { name: 'Nộp bài' }));

    await waitFor(() => {
      expect(quiz.submitQuizAttempt).toHaveBeenCalledWith(
        'course-1',
        'lesson-1',
        'attempt-1',
        { answers: [{ questionId: 'q1', selectedOptionIds: ['o1'] }] },
        'token',
      );
    });

    expect(await screen.findByText(/Kết quả bài trắc nghiệm/)).toBeTruthy();
    expect(screen.getByText(/Đạt/)).toBeTruthy();
    expect(screen.getByText(/Lựa chọn của bạn: Đáp án A/)).toBeTruthy();
    expect(screen.queryByText(/isCorrect/i)).toBeNull();
  });

  it('shows countdown from expiresAt and serverNow without starting a new attempt', async () => {
    setAccessToken('token');
    auth.fetchCurrentUser.mockResolvedValue(student);
    const future = new Date(Date.now() + 120_000).toISOString();
    quiz.getQuizSession.mockResolvedValue({
      ...take,
      expiresAt: future,
      serverNow: new Date().toISOString(),
      timeLimitMinutes: 2,
    });

    renderPlayer();

    expect(await screen.findByRole('timer')).toBeTruthy();
    expect(screen.getByText(/Thời gian còn lại:/)).toBeTruthy();
    expect(quiz.startOrResumeQuizAttempt).not.toHaveBeenCalled();
  });

  it('shows submitted result from session without resetting the timer', async () => {
    setAccessToken('token');
    auth.fetchCurrentUser.mockResolvedValue(student);
    quiz.getQuizSession.mockResolvedValue(result);

    renderPlayer();

    expect(await screen.findByText(/Kết quả bài trắc nghiệm/)).toBeTruthy();
    expect(screen.queryByRole('timer')).toBeNull();
    expect(quiz.startOrResumeQuizAttempt).not.toHaveBeenCalled();
  });

  it('shows start button when no session exists', async () => {
    setAccessToken('token');
    auth.fetchCurrentUser.mockResolvedValue(student);
    quiz.getQuizSession.mockRejectedValue(new ApiError(404, 'No quiz attempt', null));
    quiz.startOrResumeQuizAttempt.mockResolvedValue(take);

    renderPlayer();

    const startButton = await screen.findByRole('button', { name: 'Bắt đầu làm bài' });
    fireEvent.click(startButton);

    expect(await screen.findByText(/Câu 1\. Chọn một/)).toBeTruthy();
    expect(quiz.startOrResumeQuizAttempt).toHaveBeenCalled();
  });

  it('resumes the same in-progress attempt on reload without calling start', async () => {
    setAccessToken('token');
    auth.fetchCurrentUser.mockResolvedValue(student);
    const expiresAt = new Date(Date.now() + 90_000).toISOString();
    const serverNow = new Date().toISOString();
    const inProgress = {
      ...take,
      attemptId: 'attempt-resume',
      expiresAt,
      serverNow,
      timeLimitMinutes: 2,
    };
    quiz.getQuizSession.mockResolvedValue(inProgress);

    const { unmount } = renderPlayer();
    expect(await screen.findByRole('timer')).toBeTruthy();
    unmount();

    quiz.getQuizSession.mockClear();
    quiz.getQuizSession.mockResolvedValue(inProgress);
    renderPlayer();
    expect(await screen.findByRole('timer')).toBeTruthy();
    expect(quiz.startOrResumeQuizAttempt).not.toHaveBeenCalled();
    expect(quiz.getQuizSession).toHaveBeenCalled();
  });

  it('hides retake when quota is exhausted', async () => {
    setAccessToken('token');
    auth.fetchCurrentUser.mockResolvedValue(student);
    quiz.getQuizSession.mockResolvedValue({
      ...result,
      maxAttempts: 1,
      attemptsUsed: 1,
    });

    renderPlayer();

    expect(await screen.findByText(/Kết quả bài trắc nghiệm/)).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Làm lại' })).toBeNull();
    expect(screen.getByText(/đã dùng hết số lần làm bài/i)).toBeTruthy();
  });

  it('shows retake for unlimited attempts', async () => {
    setAccessToken('token');
    auth.fetchCurrentUser.mockResolvedValue(student);
    quiz.getQuizSession.mockResolvedValue({
      ...result,
      maxAttempts: null,
      attemptsUsed: 3,
    });

    renderPlayer();

    expect(await screen.findByRole('button', { name: 'Làm lại' })).toBeTruthy();
  });

  it('shows quota message when retake is rejected with 409', async () => {
    setAccessToken('token');
    auth.fetchCurrentUser.mockResolvedValue(student);
    quiz.getQuizSession.mockResolvedValue({
      ...result,
      maxAttempts: 2,
      attemptsUsed: 1,
    });
    quiz.startOrResumeQuizAttempt.mockRejectedValue(
      new ApiError(409, 'Maximum quiz attempts reached', null),
    );

    renderPlayer();
    fireEvent.click(await screen.findByRole('button', { name: 'Làm lại' }));

    expect(await screen.findByRole('alert')).toBeTruthy();
    expect(screen.getByText(/đã dùng hết số lần làm bài/i)).toBeTruthy();
    expect(screen.getByText(/Kết quả bài trắc nghiệm/)).toBeTruthy();
  });

  it('shows load error on quota conflict when starting', async () => {
    setAccessToken('token');
    auth.fetchCurrentUser.mockResolvedValue(student);
    quiz.getQuizSession.mockRejectedValue(new ApiError(404, 'No quiz attempt', null));
    quiz.startOrResumeQuizAttempt.mockRejectedValue(
      new ApiError(409, 'Maximum quiz attempts reached', null),
    );

    renderPlayer();

    fireEvent.click(await screen.findByRole('button', { name: 'Bắt đầu làm bài' }));

    expect(await screen.findByRole('alert')).toBeTruthy();
  });
});
