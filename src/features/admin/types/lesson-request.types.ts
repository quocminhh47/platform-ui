import type { LessonType } from '../../catalog/types/lesson.types';

/** Mirrors backend CreateLessonRequest. */
export type CreateLessonPayload = {
  title: string;
  lessonType: LessonType;
  contentUrl?: string | null;
  durationSeconds?: number | null;
  sortOrder?: number | null;
};

/** Mirrors backend UpdateLessonRequest (partial patch). */
export type UpdateLessonPayload = {
  title?: string;
  lessonType?: LessonType;
  contentUrl?: string | null;
  durationSeconds?: number | null;
  sortOrder?: number | null;
};
