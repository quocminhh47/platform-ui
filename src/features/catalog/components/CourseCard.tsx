import { Link } from 'react-router-dom';
import type { Course } from '../types/course.types';
import { formatPrice } from '../utils/formatPrice';

type CourseCardProps = {
  course: Course;
};

export function CourseCard({ course }: CourseCardProps) {
  return (
    <Link to={`/courses/${course.id}`} className="course-card-link">
      <article className="course-card">
        <h3>{course.title}</h3>
        <p className="course-description">
          {course.description?.trim() ? course.description : 'No description provided.'}
        </p>
        <p className="course-price">{formatPrice(course.price)}</p>
      </article>
    </Link>
  );
}
