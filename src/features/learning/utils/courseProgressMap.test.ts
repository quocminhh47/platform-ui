import { describe, expect, it } from 'vitest';
import type { SectionWithLessons } from '../../catalog/hooks/useCourseCurriculum';
import type { LessonProgress } from '../types/progress.types';
import { mergeCourseProgress, summarizeCourseProgress } from './courseProgressMap';

const sections: SectionWithLessons[] = [
  {
    id: 's1',
    courseId: 'c1',
    title: 'A',
    sortOrder: 0,
    lessons: [
      {
        id: 'l1',
        sectionId: 's1',
        courseId: 'c1',
        title: 'One',
        lessonType: 'VIDEO',
        contentUrl: null,
        durationSeconds: 1,
        sortOrder: 0,
      },
      {
        id: 'l2',
        sectionId: 's1',
        courseId: 'c1',
        title: 'Two',
        lessonType: 'ARTICLE',
        contentUrl: null,
        durationSeconds: null,
        sortOrder: 1,
      },
    ],
  },
];

describe('mergeCourseProgress', () => {
  it('defaults missing lessons to incomplete', () => {
    const persisted: LessonProgress[] = [
      {
        lessonId: 'l1',
        isCompleted: true,
        watchedDurationSeconds: 10,
        lastAccessedAt: '2026-01-01T00:00:00Z',
      },
    ];
    const map = mergeCourseProgress(sections, persisted);
    expect(map.get('l1')?.isCompleted).toBe(true);
    expect(map.get('l2')?.isCompleted).toBe(false);
  });
});

describe('summarizeCourseProgress', () => {
  it('computes percent from merged progress', () => {
    const map = mergeCourseProgress(sections, [
      {
        lessonId: 'l1',
        isCompleted: true,
        watchedDurationSeconds: 0,
        lastAccessedAt: null,
      },
    ]);
    expect(summarizeCourseProgress(sections, map)).toEqual({
      completedCount: 1,
      totalCount: 2,
      percent: 50,
    });
  });
});
