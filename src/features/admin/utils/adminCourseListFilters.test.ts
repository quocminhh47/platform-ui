import { describe, expect, it } from 'vitest';
import type { Course } from '../../catalog/types/course.types';
import { filterAndSortAdminCourses } from './adminCourseListFilters';

const base: Course = {
  id: 'c1',
  title: 'HSK 1 Basics',
  description: null,
  instructorId: 'i1',
  instructorName: 'Lan Nguyen',
  price: 0,
  lessonCount: 2,
  published: true,
  finalQuizId: null,
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-03T00:00:00Z',
};

describe('filterAndSortAdminCourses', () => {
  it('filters by query and publication status', () => {
    const courses = [
      base,
      { ...base, id: 'c2', title: 'Draft course', published: false, instructorName: 'Other' },
    ];
    expect(
      filterAndSortAdminCourses(courses, 'lan', 'all', 'newest').map((c) => c.id),
    ).toEqual(['c1']);
    expect(
      filterAndSortAdminCourses(courses, '', 'draft', 'newest').map((c) => c.id),
    ).toEqual(['c2']);
  });

  it('sorts by lessons and date', () => {
    const courses = [
      { ...base, id: 'a', lessonCount: 1, updatedAt: '2026-01-01T00:00:00Z' },
      { ...base, id: 'b', lessonCount: 5, updatedAt: '2026-01-05T00:00:00Z' },
    ];
    expect(filterAndSortAdminCourses(courses, '', 'all', 'lessons').map((c) => c.id)).toEqual([
      'b',
      'a',
    ]);
    expect(filterAndSortAdminCourses(courses, '', 'all', 'oldest').map((c) => c.id)).toEqual([
      'a',
      'b',
    ]);
  });
});
