import { Link } from 'react-router-dom';
import { UI_COPY } from '../../../ui/ui-copy';
import type { Course } from '../types/course.types';
import { formatPrice } from '../utils/formatPrice';
import { CourseImage } from './CourseImage';

type CourseCardProps = {
  course: Course;
  variant?: 'default' | 'catalog';
};

export function CourseCard({ course, variant = 'default' }: CourseCardProps) {
  const catalog = variant === 'catalog';
  const instructor = course.instructorName?.trim() || null;
  const lessonCount = typeof course.lessonCount === 'number' ? course.lessonCount : null;
  const description = course.description?.trim();

  return (
    <Link to={`/courses/${course.id}`} className="course-card-link">
      <article className={catalog ? 'course-card course-card-catalog' : 'course-card'}>
        <CourseImage
          courseId={course.id}
          title={course.title}
          thumbnailUrl={course.thumbnailUrl}
        />
        <div className="course-card-body">
          <h3>{course.title}</h3>
          {catalog ? null : description ? (
            <p className="course-description">{description}</p>
          ) : null}
          {instructor ? (
            <p className="course-card-instructor">
              {UI_COPY.instructor}: {instructor}
            </p>
          ) : null}
          {catalog ? (
            <p className="course-card-meta">
              <span>{formatPrice(course.price)}</span>
              {lessonCount !== null ? (
                <span>
                  {lessonCount === 1 ? '1 bài học' : `${lessonCount} bài học`}
                </span>
              ) : null}
              <time dateTime={course.createdAt}>{formatCourseDate(course.createdAt)}</time>
            </p>
          ) : (
            <>
              <p className="course-price">{formatPrice(course.price)}</p>
              {lessonCount !== null ? (
                <p className="course-card-lessons muted">
                  {lessonCount === 1 ? '1 bài học' : `${lessonCount} bài học`}
                </p>
              ) : null}
            </>
          )}
        </div>
      </article>
    </Link>
  );
}

function formatCourseDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '';
  }
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
}
