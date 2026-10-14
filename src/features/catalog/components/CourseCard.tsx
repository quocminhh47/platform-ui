import { Link } from 'react-router-dom';
import type { Course } from '../types/course.types';
import { formatPrice } from '../utils/formatPrice';
import { CourseImage } from './CourseImage';

type CourseCardProps = {
  course: Course;
  variant?: 'default' | 'catalog';
};

export function CourseCard({ course, variant = 'default' }: CourseCardProps) {
  const catalog = variant === 'catalog';

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
          {catalog ? null : (
            <p className="course-description">
              {course.description?.trim() ? course.description : 'No description provided.'}
            </p>
          )}
          {catalog ? (
            <p className="course-card-meta">
              <span>{formatPrice(course.price)}</span>
              <time dateTime={course.createdAt}>{formatCourseDate(course.createdAt)}</time>
            </p>
          ) : (
            <p className="course-price">{formatPrice(course.price)}</p>
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
  return new Intl.DateTimeFormat(undefined, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
}
