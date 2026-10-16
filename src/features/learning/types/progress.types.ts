/** Mirrors backend LessonProgressResponse. */
export type LessonProgress = {
  lessonId: string;
  isCompleted: boolean;
  watchedDurationSeconds: number;
  lastAccessedAt: string | null;
};

export type LessonProgressView = LessonProgress;

export type SectionProgressSummary = {
  sectionId: string;
  completedCount: number;
  totalCount: number;
};

export type CourseProgressSummary = {
  completedCount: number;
  totalCount: number;
  percent: number;
};
