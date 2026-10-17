import { Link } from 'react-router-dom';
import { CourseImage } from '../../catalog/components/CourseImage';
import { useAuth } from '../../auth/hooks/useAuth';
import type { Enrollment } from '../api/enrollments.api';
import { useEnrollmentLearnTarget } from '../hooks/useEnrollmentLearnTarget';

type EnrollmentCourseCardProps = {
  enrollment: Enrollment;
};

export function EnrollmentCourseCard({ enrollment }: EnrollmentCourseCardProps) {
  const { accessToken } = useAuth();
  const learn = useEnrollmentLearnTarget(enrollment, accessToken);
  const showLearnCta = enrollment.status === 'ACTIVE' || enrollment.status === 'COMPLETED';

  return (
    <article className="enrollment-card">
      <Link className="enrollment-card-media" to={`/courses/${enrollment.courseId}`}>
        <CourseImage courseId={enrollment.courseId} title={enrollment.courseTitle} />
      </Link>
      <div className="enrollment-card-body">
        <h3>
          <Link to={`/courses/${enrollment.courseId}`}>{enrollment.courseTitle}</Link>
        </h3>
        <p className="enrollment-card-status">{statusLabel(enrollment.status)}</p>
        {learn.noLessons && showLearnCta && !learn.loading ? (
          <p className="muted enrollment-card-note">Khóa học chưa có bài học.</p>
        ) : null}
        {learn.error && showLearnCta && !learn.loading ? (
          <p className="muted enrollment-card-note">{learn.error}</p>
        ) : null}
        {showLearnCta ? (
          learn.loading ? (
            <p className="page-status enrollment-card-loading">Đang tải…</p>
          ) : (
            <Link className="button-primary enrollment-card-cta" to={learn.path}>
              {learn.label}
            </Link>
          )
        ) : null}
      </div>
    </article>
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
