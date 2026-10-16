import { Link } from 'react-router-dom';
import { CourseImage } from '../../catalog/components/CourseImage';
import type { Enrollment } from '../api/enrollments.api';

type EnrollmentCourseCardProps = {
  enrollment: Enrollment;
};

export function EnrollmentCourseCard({ enrollment }: EnrollmentCourseCardProps) {
  return (
    <Link className="enrollment-card-link" to={`/courses/${enrollment.courseId}`}>
      <article className="enrollment-card">
        <CourseImage courseId={enrollment.courseId} title={enrollment.courseTitle} />
        <div className="enrollment-card-body">
          <h3>{enrollment.courseTitle}</h3>
          <p className="enrollment-card-status">{statusLabel(enrollment.status)}</p>
        </div>
      </article>
    </Link>
  );
}

function statusLabel(status: Enrollment['status']): string {
  if (status === 'ACTIVE') {
    return 'In progress';
  }
  if (status === 'COMPLETED') {
    return 'Completed';
  }
  if (status === 'PENDING') {
    return 'Pending';
  }
  return 'Dropped';
}
