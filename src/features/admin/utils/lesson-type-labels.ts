import type { LessonType } from '../../catalog/types/lesson.types';

const LABELS: Record<LessonType, string> = {
  VIDEO: 'Video',
  ARTICLE: 'Bài đọc',
  QUIZ: 'Quiz',
  ASSIGNMENT: 'Bài tập',
};

export function adminLessonTypeLabel(lessonType: LessonType): string {
  return LABELS[lessonType] ?? lessonType;
}

export const ADMIN_LESSON_TYPE_OPTIONS: LessonType[] = [
  'VIDEO',
  'ARTICLE',
  'QUIZ',
  'ASSIGNMENT',
];
