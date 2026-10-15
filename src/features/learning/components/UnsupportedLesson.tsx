import { formatLessonType } from '../../catalog/utils/formatLessonType';
import type { LessonType } from '../../catalog/types/lesson.types';

export function UnsupportedLesson({ lessonType }: { lessonType: LessonType }) {
  return (
    <p className="muted">
      {formatLessonType(lessonType)} lessons are not available in the player yet.
    </p>
  );
}
