import type { Course } from '../types/course.types';

type CourseCardProps = {
  course: Course;
};

export function CourseCard({ course }: CourseCardProps) {
  return (
    <article className="course-card">
      <h3>{course.title}</h3>
      <p className="course-description">
        {course.description?.trim() ? course.description : 'No description provided.'}
      </p>
      <p className="course-price">{formatPrice(course.price)}</p>
    </article>
  );
}

function formatPrice(price: number): string {
  if (!Number.isFinite(price) || price <= 0) {
    return 'Free';
  }
  return new Intl.NumberFormat(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(price);
}
