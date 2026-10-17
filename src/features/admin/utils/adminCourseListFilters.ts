import type { Course } from '../../catalog/types/course.types';

export type AdminCourseStatusFilter = 'all' | 'published' | 'draft';

export type AdminCourseSort = 'newest' | 'oldest' | 'lessons';

export function filterAndSortAdminCourses(
  courses: Course[],
  query: string,
  status: AdminCourseStatusFilter,
  sort: AdminCourseSort,
): Course[] {
  const normalized = query.trim().toLowerCase();
  let result = courses.filter((course) => {
    if (status === 'published' && !course.published) {
      return false;
    }
    if (status === 'draft' && course.published) {
      return false;
    }
    if (!normalized) {
      return true;
    }
    const haystack = [
      course.title,
      course.instructorName ?? '',
      course.instructorId,
      course.id,
    ]
      .join(' ')
      .toLowerCase();
    return haystack.includes(normalized);
  });

  result = [...result].sort((a, b) => compareCourses(a, b, sort));
  return result;
}

function compareCourses(a: Course, b: Course, sort: AdminCourseSort): number {
  if (sort === 'lessons') {
    return (b.lessonCount ?? 0) - (a.lessonCount ?? 0);
  }
  const aTime = Date.parse(a.updatedAt || a.createdAt);
  const bTime = Date.parse(b.updatedAt || b.createdAt);
  if (sort === 'oldest') {
    return aTime - bTime;
  }
  return bTime - aTime;
}

export function countCoursesByStatus(courses: Course[]): {
  published: number;
  draft: number;
} {
  let published = 0;
  let draft = 0;
  for (const course of courses) {
    if (course.published) {
      published += 1;
    } else {
      draft += 1;
    }
  }
  return { published, draft };
}

export function instructorInitials(name: string | null | undefined): string {
  const trimmed = name?.trim();
  if (!trimmed) {
    return '?';
  }
  const parts = trimmed.split(/\s+/).filter(Boolean);
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return `${parts[0][0] ?? ''}${parts[parts.length - 1][0] ?? ''}`.toUpperCase();
}
