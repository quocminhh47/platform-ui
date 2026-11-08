import { Link } from 'react-router-dom';
import type { Lesson } from '../../catalog/types/lesson.types';

type LessonNavProps = {
  courseId: string;
  previous: Lesson | null;
  next: Lesson | null;
};

export function LessonNav({ courseId, previous, next }: LessonNavProps) {
  return (
    <nav className="learning-nav" aria-label="Bài học">
      {previous ? (
        <Link to={`/courses/${courseId}/learn/${previous.id}`}>Bài trước</Link>
      ) : (
        <span className="learning-nav-disabled">Bài trước</span>
      )}
      {next ? (
        <Link to={`/courses/${courseId}/learn/${next.id}`}>Bài tiếp theo</Link>
      ) : (
        <span className="learning-nav-disabled">Bài tiếp theo</span>
      )}
    </nav>
  );
}
