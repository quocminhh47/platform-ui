import type { SectionWithLessons } from '../../catalog/hooks/useCourseCurriculum';
import type { Lesson } from '../../catalog/types/lesson.types';
import type { LessonProgress } from '../types/progress.types';

function sortBySortOrder<T extends { sortOrder: number }>(items: T[]): T[] {
  return [...items].sort((a, b) => a.sortOrder - b.sortOrder);
}

/** Flatten curriculum in section/lesson sort order (matches learning workspace sidebar order). */
export function flattenCurriculumLessons(sections: SectionWithLessons[] | null): Lesson[] {
  if (!sections) {
    return [];
  }
  return sortBySortOrder(sections).flatMap((section) =>
    sortBySortOrder(section.lessons),
  );
}

/**
 * Prefer the first incomplete lesson in curriculum order; otherwise the most recently
 * accessed lesson; otherwise the first lesson.
 */
export function pickResumeLessonId(
  lessons: Lesson[],
  progressRows: LessonProgress[],
): string | undefined {
  if (lessons.length === 0) {
    return undefined;
  }

  const progressByLessonId = new Map(progressRows.map((row) => [row.lessonId, row]));

  for (const lesson of lessons) {
    if (!progressByLessonId.get(lesson.id)?.isCompleted) {
      return lesson.id;
    }
  }

  let latest: { lessonId: string; lastAccessedAt: string } | null = null;
  for (const row of progressRows) {
    if (!row.lastAccessedAt) {
      continue;
    }
    if (!latest || row.lastAccessedAt > latest.lastAccessedAt) {
      latest = { lessonId: row.lessonId, lastAccessedAt: row.lastAccessedAt };
    }
  }
  if (latest && lessons.some((lesson) => lesson.id === latest.lessonId)) {
    return latest.lessonId;
  }

  return lessons[0]?.id;
}

export function buildLearningPath(courseId: string, lessonId?: string): string {
  if (!lessonId) {
    return `/courses/${courseId}/learn`;
  }
  return `/courses/${courseId}/learn/${lessonId}`;
}

export function learnCtaLabel(
  lessons: Lesson[],
  progressRows: LessonProgress[],
): 'Bắt đầu học' | 'Tiếp tục học' {
  if (lessons.length === 0) {
    return 'Bắt đầu học';
  }
  const started = progressRows.some(
    (row) =>
      row.isCompleted ||
      row.lastAccessedAt !== null ||
      row.watchedDurationSeconds > 0,
  );
  return started ? 'Tiếp tục học' : 'Bắt đầu học';
}
