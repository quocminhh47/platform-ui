import type { SectionWithLessons } from '../hooks/useCourseCurriculum';
import type { LessonType } from '../types/lesson.types';
export type CurriculumSummary = {
  sectionCount: number;
  lessonCount: number;
  totalDurationSeconds: number;
  lessonsByType: Partial<Record<LessonType, number>>;
};

export function summarizeCurriculum(sections: SectionWithLessons[] | null): CurriculumSummary {
  const empty: CurriculumSummary = {
    sectionCount: 0,
    lessonCount: 0,
    totalDurationSeconds: 0,
    lessonsByType: {},
  };
  if (!sections) {
    return empty;
  }

  let lessonCount = 0;
  let totalDurationSeconds = 0;
  const lessonsByType: Partial<Record<LessonType, number>> = {};

  for (const section of sections) {
    for (const lesson of section.lessons) {
      lessonCount += 1;
      lessonsByType[lesson.lessonType] = (lessonsByType[lesson.lessonType] ?? 0) + 1;
      if (lesson.durationSeconds !== null && Number.isFinite(lesson.durationSeconds)) {
        totalDurationSeconds += lesson.durationSeconds;
      }
    }
  }

  return {
    sectionCount: sections.length,
    lessonCount,
    totalDurationSeconds,
    lessonsByType,
  };
}

export function formatCurriculumSummaryLine(summary: CurriculumSummary): string {
  const parts: string[] = [];
  if (summary.sectionCount > 0) {
    parts.push(`${summary.sectionCount} phần`);
  }
  if (summary.lessonCount > 0) {
    parts.push(`${summary.lessonCount} bài học`);
  }
  const duration = formatTotalDuration(summary.totalDurationSeconds);
  if (duration) {
    parts.push(`Tổng thời lượng ${duration}`);
  }
  return parts.join(' • ');
}

function formatTotalDuration(totalSeconds: number): string | null {
  if (totalSeconds <= 0) {
    return null;
  }
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.round((totalSeconds % 3600) / 60);
  if (hours > 0 && minutes > 0) {
    return `${hours} giờ ${minutes} phút`;
  }
  if (hours > 0) {
    return `${hours} giờ`;
  }
  const asMinutes = Math.max(1, Math.round(totalSeconds / 60));
  return `${asMinutes} phút`;
}
