import { describe, expect, it } from 'vitest';
import { resolveCourseImageUrl } from '../config/courseImages';
import type { Course } from '../types/course.types';
import { searchLoadedCourses } from './courseSearch';

function course(partial: Partial<Course> & Pick<Course, 'id' | 'title'>): Course {
  return {
    description: null,
    instructorId: 'instructor-1',
    price: 0,
    published: true,
    finalQuizId: null,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
    ...partial,
  };
}

describe('searchLoadedCourses', () => {
  const courses = [
    course({ id: 'a', title: 'HSK 1 Vocabulary', description: 'Grammar drills' }),
    course({ id: 'b', title: 'Business Chinese', instructorName: 'Lan Pham' }),
  ];

  it('returns the loaded list when the query is blank', () => {
    expect(searchLoadedCourses(courses, '  ')).toEqual(courses);
  });

  it('matches title, description, and instructor on the loaded list only', () => {
    expect(searchLoadedCourses(courses, 'grammar').map((item) => item.id)).toEqual(['a']);
    expect(searchLoadedCourses(courses, 'lan pham').map((item) => item.id)).toEqual(['b']);
  });
});

describe('resolveCourseImageUrl', () => {
  it('prefers the API thumbnail and falls back to the id map only when it is blank', () => {
    expect(resolveCourseImageUrl('any', ' https://cdn.example/a.png ')).toBe(
      'https://cdn.example/a.png',
    );
    expect(resolveCourseImageUrl('dec00001-0001-4001-8001-000000000001', '  ')).toBeNull();
    expect(resolveCourseImageUrl('unknown-course', null)).toBeNull();
  });
});
