import { Link } from 'react-router-dom';
import type { Enrollment } from '../../enrollment/api/enrollments.api';
import { useEnrollmentLearnTarget } from '../../enrollment/hooks/useEnrollmentLearnTarget';
import { useAuth } from '../../auth/hooks/useAuth';
import { EmptyState } from './EmptyState';
import { UI_COPY } from '../../../ui/ui-copy';

type ContinueLearningSectionProps = {
  enrollments: Enrollment[] | null;
  enrollmentsLoading: boolean;
  enrollmentsError: string | null;
  onRetry?: () => void;
};

export function ContinueLearningSection({
  enrollments,
  enrollmentsLoading,
  enrollmentsError,
  onRetry,
}: ContinueLearningSectionProps) {
  // Sort ACTIVE enrollments by enrolledAt descending so the most recently
  // enrolled course is always the resume target — deterministic regardless of
  // API response order.
  const resumeTarget = pickResumeTarget(enrollments);

  return (
    <section className="dashboard-section" aria-labelledby="continue-heading">
      <h2 id="continue-heading">Tiếp tục học</h2>
      {enrollmentsLoading ? (
        <p className="page-status" style={{ padding: '0.25rem 0' }}>Đang tải…</p>
      ) : enrollmentsError ? (
        <div className="section-error" role="alert">
          <p>{enrollmentsError}</p>
          {onRetry ? (
            <button type="button" onClick={onRetry}>
              {UI_COPY.tryAgain}
            </button>
          ) : null}
        </div>
      ) : resumeTarget ? (
        <ResumeCourseCard enrollment={resumeTarget} />
      ) : (
        <EmptyState
          title="Chưa có bài học để tiếp tục"
          description={
            (enrollments?.length ?? 0) > 0
              ? 'Ghi danh một khóa đang hoạt động để bắt đầu học.'
              : 'Ghi danh một khóa học để bắt đầu lộ trình của bạn.'
          }
        />
      )}
    </section>
  );
}

/**
 * Pick the ACTIVE enrollment with the most recent `enrolledAt` date.
 * Returns null when there are no ACTIVE enrollments.
 */
function pickResumeTarget(enrollments: Enrollment[] | null): Enrollment | null {
  if (!enrollments) return null;
  const active = enrollments.filter((e) => e.status === 'ACTIVE');
  if (active.length === 0) return null;
  // Sort descending by ISO enrolledAt string (lexicographic = chronological)
  return active.slice().sort((a, b) => b.enrolledAt.localeCompare(a.enrolledAt))[0];
}

function ResumeCourseCard({ enrollment }: { enrollment: Enrollment }) {
  const { accessToken } = useAuth();
  const learn = useEnrollmentLearnTarget(enrollment, accessToken);

  return (
    <div className="continue-card">
      <div className="continue-card-info">
        <p className="continue-card-title">{enrollment.courseTitle}</p>
        {learn.noLessons && !learn.loading ? (
          <p className="continue-card-status muted">Khóa học chưa có bài học.</p>
        ) : learn.error && !learn.loading ? (
          <p className="continue-card-status muted">{learn.error}</p>
        ) : null}
      </div>
      {!learn.noLessons && !learn.error ? (
        learn.loading ? (
          <p className="page-status" style={{ padding: '0.25rem 0' }}>Đang tải…</p>
        ) : (
          <Link className="button-primary continue-card-cta" to={learn.path}>
            {learn.label}
          </Link>
        )
      ) : null}
    </div>
  );
}
