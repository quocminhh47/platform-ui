import type { LessonType } from '../types/lesson.types';

const LABELS: Record<LessonType, string> = {
  VIDEO: 'Video',
  ARTICLE: 'Article',
  QUIZ: 'Quiz',
  ASSIGNMENT: 'Assignment',
};

export function formatLessonType(lessonType: LessonType): string {
  return LABELS[lessonType] ?? lessonType;
}
