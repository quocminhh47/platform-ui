import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { UpsertQuizPayload } from '../types/admin-quiz.types';
import { getQuiz, upsertQuiz } from './admin-quiz.api';

const apiRequest = vi.fn();

vi.mock('../../../services/api/client', () => ({
  apiRequest: (...args: unknown[]) => apiRequest(...args),
}));

const token = 'admin-token';

describe('admin quiz api', () => {
  beforeEach(() => {
    apiRequest.mockReset();
    apiRequest.mockResolvedValue({});
  });

  it('gets quiz for a lesson', async () => {
    await getQuiz(token, 'course-1', 'lesson-quiz');

    expect(apiRequest).toHaveBeenCalledWith('/api/courses/course-1/lessons/lesson-quiz/quiz', {
      accessToken: token,
    });
  });

  it('upserts quiz with PUT', async () => {
    const body: UpsertQuizPayload = {
      passingScore: 80,
      timeLimitMinutes: 30,
      maxAttempts: 3,
      questions: [
        {
          questionText: 'Q1',
          questionType: 'SINGLE_CHOICE',
          scoreWeight: 1,
          options: [
            { optionText: 'A', isCorrect: true },
            { optionText: 'B', isCorrect: false },
          ],
        },
      ],
    };
    await upsertQuiz(token, 'course-1', 'lesson-quiz', body);

    expect(apiRequest).toHaveBeenCalledWith('/api/courses/course-1/lessons/lesson-quiz/quiz', {
      method: 'PUT',
      accessToken: token,
      body,
    });
  });
});
