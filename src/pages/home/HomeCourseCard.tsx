import { Link } from 'react-router-dom';
import { CourseImage } from '../../features/catalog/components/CourseImage';
import type { Course } from '../../features/catalog/types/course.types';
import { formatPrice } from '../../features/catalog/utils/formatPrice';

type HomeCourseCardProps = {
  course: Course;
};

export function HomeCourseCard({ course }: HomeCourseCardProps) {
  const instructor = course.instructorName?.trim() || null;
  const lessonCount = typeof course.lessonCount === 'number' ? course.lessonCount : null;
  const description = course.description?.trim() || null;

  return (
    <Link className="home-course-link" to={`/courses/${course.id}`}>
      <article className="home-course-card">
        <CourseImage courseId={course.id} title={course.title} thumbnailUrl={course.thumbnailUrl} />
        <div className="home-course-body">
          <h3 title={course.title}>{course.title}</h3>
          {description ? <p className="home-course-description">{description}</p> : null}
          <p className="home-course-price">{formatPrice(course.price)}</p>
          {instructor || lessonCount !== null ? (
            <p className="home-course-facts">
              {instructor ? <span>{instructor}</span> : null}
              {lessonCount !== null ? <span>{lessonCount} bài học</span> : null}
            </p>
          ) : null}
        </div>
      </article>
    </Link>
  );
}
