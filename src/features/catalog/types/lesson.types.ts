/** Mirrors backend LessonType enum. */
export type LessonType = 'VIDEO' | 'ARTICLE' | 'QUIZ' | 'ASSIGNMENT';

/** Mirrors backend LessonResponse. */
export type Lesson = {
  id: string;
  sectionId: string;
  courseId: string;
  title: string;
  lessonType: LessonType;
  contentUrl: string | null;
  durationSeconds: number | null;
  sortOrder: number;
};
