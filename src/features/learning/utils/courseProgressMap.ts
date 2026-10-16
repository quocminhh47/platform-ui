import type { SectionWithLessons } from '../../catalog/hooks/useCourseCurriculum';
import type {
  CourseProgressSummary,
  LessonProgress,
  LessonProgressView,
  SectionProgressSummary,
} from '../types/progress.types';

const UNSTARTED: Omit<LessonProgressView, 'lessonId'> = {
  isCompleted: false,
  watchedDurationSeconds: 0,
  lastAccessedAt: null,
};

export function mergeCourseProgress(
  sections: SectionWithLessons[] | null,
  persisted: LessonProgress[],
): Map<string, LessonProgressView> {
  const byLessonId = new Map<string, LessonProgressView>();
  for (const row of persisted) {
    byLessonId.set(row.lessonId, row);
  }
  if (!sections) {
    return byLessonId;
  }
  for (const section of sections) {
    for (const lesson of section.lessons) {
      if (!byLessonId.has(lesson.id)) {
        byLessonId.set(lesson.id, { lessonId: lesson.id, ...UNSTARTED });
      }
    }
  }
  return byLessonId;
}

export function upsertProgressRow(
  rows: LessonProgress[],
  updated: LessonProgress,
): LessonProgress[] {
  const index = rows.findIndex((row) => row.lessonId === updated.lessonId);
  if (index < 0) {
    return [...rows, updated];
  }
  const next = [...rows];
  next[index] = updated;
  return next;
}

export function summarizeSectionProgress(
  section: SectionWithLessons,
  progressByLessonId: Map<string, LessonProgressView>,
): SectionProgressSummary {
  let completedCount = 0;
  for (const lesson of section.lessons) {
    if (progressByLessonId.get(lesson.id)?.isCompleted) {
      completedCount += 1;
    }
  }
  return {
    sectionId: section.id,
    completedCount,
    totalCount: section.lessons.length,
  };
}

export function summarizeCourseProgress(
  sections: SectionWithLessons[] | null,
  progressByLessonId: Map<string, LessonProgressView>,
): CourseProgressSummary {
  if (!sections || sections.length === 0) {
    return { completedCount: 0, totalCount: 0, percent: 0 };
  }
  let completedCount = 0;
  let totalCount = 0;
  for (const section of sections) {
    for (const lesson of section.lessons) {
      totalCount += 1;
      if (progressByLessonId.get(lesson.id)?.isCompleted) {
        completedCount += 1;
      }
    }
  }
  const percent = totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);
  return { completedCount, totalCount, percent };
}
