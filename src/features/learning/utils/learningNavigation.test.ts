import { describe, expect, it } from 'vitest';
import type { Lesson } from '../../catalog/types/lesson.types';
import type { LessonProgress } from '../types/progress.types';
import {
  buildLearningPath,
  flattenCurriculumLessons,
  learnCtaLabel,
  pickResumeLessonId,
} from './learningNavigation';

const lesson = (id: string, sortOrder: number): Lesson => ({
  id,
  sectionId: 'sec-1',
  courseId: 'course-1',
  title: id,
  lessonType: 'VIDEO',
  contentUrl: null,
  durationSeconds: null,
  sortOrder,
});

describe('learningNavigation', () => {
  it('orders lessons by section and lesson sortOrder', () => {
    const flat = flattenCurriculumLessons([
      {
        id: 'sec-b',
        courseId: 'course-1',
        title: 'B',
        sortOrder: 2,
        lessons: [lesson('l2', 1)],
      },
      {
        id: 'sec-a',
        courseId: 'course-1',
        title: 'A',
        sortOrder: 1,
        lessons: [lesson('l1', 1)],
      },
    ]);
    expect(flat.map((item) => item.id)).toEqual(['l1', 'l2']);
  });

  it('picks the first incomplete lesson', () => {
    const lessons = [lesson('l1', 1), lesson('l2', 2)];
    const progress: LessonProgress[] = [
      {
        lessonId: 'l1',
        isCompleted: true,
        watchedDurationSeconds: 10,
        lastAccessedAt: '2026-01-02T00:00:00Z',
      },
    ];
    expect(pickResumeLessonId(lessons, progress)).toBe('l2');
  });

  it('uses CTA labels based on progress', () => {
    const lessons = [lesson('l1', 1)];
    expect(learnCtaLabel(lessons, [])).toBe('Bắt đầu học');
    expect(
      learnCtaLabel(lessons, [
        {
          lessonId: 'l1',
          isCompleted: false,
          watchedDurationSeconds: 0,
          lastAccessedAt: '2026-01-01T00:00:00Z',
        },
      ]),
    ).toBe('Tiếp tục học');
  });

  it('builds learning paths', () => {
    expect(buildLearningPath('c1')).toBe('/courses/c1/learn');
    expect(buildLearningPath('c1', 'l1')).toBe('/courses/c1/learn/l1');
  });
});
