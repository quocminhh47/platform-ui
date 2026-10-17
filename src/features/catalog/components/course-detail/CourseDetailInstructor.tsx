import type { Course } from '../../types/course.types';

type CourseDetailInstructorProps = {
  course: Course;
};

export function CourseDetailInstructor({ course }: CourseDetailInstructorProps) {
  const name = course.instructorName?.trim();
  if (!name) {
    return null;
  }

  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <section
      id="course-instructor"
      className="course-detail-panel"
      aria-labelledby="course-instructor-heading"
    >
      <h2 id="course-instructor-heading">Giảng viên giảng dạy</h2>
      <div className="course-detail-instructor-card">
        <div className="course-detail-instructor-avatar" aria-hidden="true">{initials}</div>
        <div>
          <h3>{name}</h3>
          <p className="muted">Giảng viên phụ trách khóa học trên nền tảng LMS.</p>
        </div>
      </div>
    </section>
  );
}
