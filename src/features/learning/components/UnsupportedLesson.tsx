import { formatLessonType } from '../../catalog/utils/formatLessonType';
import type { LessonType } from '../../catalog/types/lesson.types';

export function UnsupportedLesson({ lessonType }: { lessonType: LessonType }) {
  return (
    <p className="muted">
      Bài {formatLessonType(lessonType)} chưa được hỗ trợ trong trình phát.
    </p>
  );
}
