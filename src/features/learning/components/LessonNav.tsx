import { Link } from 'react-router-dom';
import type { Lesson } from '../../catalog/types/lesson.types';

type LessonNavProps = {
  courseId: string;
  previous: Lesson | null;
  next: Lesson | null;
};

export function LessonNav({ courseId, previous, next }: LessonNavProps) {
  return (
    <nav className="learning-nav" aria-label="Lesson">
      {previous ? (
        <Link to={`/courses/${courseId}/learn/${previous.id}`}>Previous lesson</Link>
      ) : (
        <span className="learning-nav-disabled">Previous lesson</span>
      )}
      {next ? (
        <Link to={`/courses/${courseId}/learn/${next.id}`}>Next lesson</Link>
      ) : (
        <span className="learning-nav-disabled">Next lesson</span>
      )}
    </nav>
  );
}
