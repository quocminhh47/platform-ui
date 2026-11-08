import type { Course } from '../../catalog/types/course.types';
import { countCoursesByStatus } from './adminCourseListFilters';

export type AdminCourseMetrics = {
  total: number;
  published: number;
  draft: number;
  withLessons: number;
  emptyCurriculum: number;
};

export function deriveAdminCourseMetrics(courses: Course[]): AdminCourseMetrics {
  const { published, draft } = countCoursesByStatus(courses);
  let withLessons = 0;
  let emptyCurriculum = 0;
  for (const course of courses) {
    if (typeof course.lessonCount !== 'number') {
      continue;
    }
    if (course.lessonCount > 0) {
      withLessons += 1;
    } else {
      emptyCurriculum += 1;
    }
  }
  return {
    total: courses.length,
    published,
    draft,
    withLessons,
    emptyCurriculum,
  };
}

export type AdminCurriculumIndicator = {
  primary: string;
  secondary?: string;
  tone: 'unknown' | 'empty' | 'has-content';
};

/** Informational label only; never treats missing counts as zero. */
export function adminCurriculumIndicator(lessonCount: number | undefined): AdminCurriculumIndicator {
  if (typeof lessonCount !== 'number') {
    return {
      primary: 'Chưa có dữ liệu',
      tone: 'unknown',
    };
  }
  if (lessonCount === 0) {
    return {
      primary: 'Chưa có bài học',
      secondary: 'Giáo trình trống',
      tone: 'empty',
    };
  }
  const primary = lessonCount === 1 ? '1 bài học' : `${lessonCount} bài học`;
  return {
    primary,
    secondary: 'Có giáo trình',
    tone: 'has-content',
  };
}
