import { describe, expect, it } from 'vitest';
import type { Course } from '../../catalog/types/course.types';
import { adminCurriculumIndicator, deriveAdminCourseMetrics } from './adminDashboardMetrics';

const course: Course = {
  id: 'c1',
  title: 'Test',
  description: null,
  instructorId: 'i1',
  price: 0,
  published: true,
  finalQuizId: null,
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-02T00:00:00Z',
};

describe('deriveAdminCourseMetrics', () => {
  it('counts publication and curriculum buckets from course list', () => {
    const metrics = deriveAdminCourseMetrics([
      { ...course, lessonCount: 2 },
      { ...course, id: 'c2', published: false, lessonCount: 0 },
      { ...course, id: 'c3', lessonCount: 5 },
    ]);
    expect(metrics.total).toBe(3);
    expect(metrics.published).toBe(2);
    expect(metrics.draft).toBe(1);
    expect(metrics.withLessons).toBe(2);
    expect(metrics.emptyCurriculum).toBe(1);
  });
});

describe('adminCurriculumIndicator', () => {
  it('does not treat missing lessonCount as zero', () => {
    expect(adminCurriculumIndicator(undefined).tone).toBe('unknown');
  });

  it('labels empty and populated curriculum', () => {
    expect(adminCurriculumIndicator(0).tone).toBe('empty');
    expect(adminCurriculumIndicator(3).primary).toBe('3 bài học');
    expect(adminCurriculumIndicator(3).tone).toBe('has-content');
  });
});
