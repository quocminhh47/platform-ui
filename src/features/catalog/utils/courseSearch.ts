import type { Course } from '../types/course.types';

/**
 * Filters courses already returned by GET /api/courses?published=true.
 * The API has no search endpoint, so this never queries the database.
 */
export function searchLoadedCourses(courses: Course[], query: string): Course[] {
  const needle = query.trim().toLowerCase();
  if (!needle) {
    return courses;
  }
  return courses.filter((course) => searchableText(course).includes(needle));
}

function searchableText(course: Course): string {
  return [course.title, course.description ?? '', course.instructorName ?? '']
    .join(' ')
    .toLowerCase();
}
