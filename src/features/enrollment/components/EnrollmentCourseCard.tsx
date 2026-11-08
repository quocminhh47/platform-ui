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

  // Derive finer-grained status label from actual progress data, not from the
  // translated CTA label. `learn.hasProgress` is set from real progress rows.
  const displayStatus = deriveDisplayStatus(enrollment, learn.loading, learn.hasProgress);

  return (
    <article className="enrollment-card">
      <Link className="enrollment-card-media" to={`/courses/${enrollment.courseId}`}>
        <CourseImage courseId={enrollment.courseId} title={enrollment.courseTitle} />
      </Link>
      <div className="enrollment-card-body">
        <h3>
          <Link to={`/courses/${enrollment.courseId}`}>{enrollment.courseTitle}</Link>
        </h3>
        <p className={`enrollment-card-status enrollment-card-status-${statusModifier(enrollment.status, learn.hasProgress, learn.loading)}`}>
          {displayStatus}
        </p>
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

/**
 * Determine the human-readable status label for an enrollment card.
 * For ACTIVE enrollments the distinction between "not started" and "in progress"
 * comes from `hasProgress` (a boolean derived from actual progress rows inside
 * `useEnrollmentLearnTarget`) — never from a translated label string.
 */
function deriveDisplayStatus(
  enrollment: Enrollment,
  loading: boolean,
  hasProgress: boolean,
): string {
  if (enrollment.status === 'COMPLETED') return 'Đã hoàn thành';
  if (enrollment.status === 'PENDING') return 'Đang chờ';
  if (enrollment.status === 'DROPPED') return 'Đã hủy';
  // ACTIVE: show neutral text while progress is still loading to avoid flicker
  if (loading) return 'Đang học';
  return hasProgress ? 'Đang học' : 'Chưa bắt đầu';
}

function statusModifier(
  status: Enrollment['status'],
  hasProgress: boolean,
  loading: boolean,
): string {
  if (status === 'COMPLETED') return 'completed';
  if (status === 'PENDING') return 'pending';
  if (status === 'DROPPED') return 'dropped';
  // ACTIVE
  if (loading) return 'active';
  return hasProgress ? 'active' : 'not-started';
}
