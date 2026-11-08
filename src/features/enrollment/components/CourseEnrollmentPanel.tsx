import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useToast } from '../../../components/feedback/useToast';
import { UI_COPY } from '../../../ui/ui-copy';
import { ApiError } from '../../../services/api/api-error';
import { useAuth } from '../../auth/hooks/useAuth';
import { enrollInCourse } from '../api/enrollments.api';
import type { Enrollment } from '../api/enrollments.api';
import { ENROLL_SUCCESS_TOAST } from '../enrollment-messages';
import { enrollmentLoadMessage, useMyEnrollments } from '../hooks/useMyEnrollments';
import { buildLearningPath } from '../../learning/utils/learningNavigation';
import { useEnrollmentLearnTarget } from '../hooks/useEnrollmentLearnTarget';

type CourseEnrollmentPanelProps = {
  courseId: string;
};

export function CourseEnrollmentPanel({ courseId }: CourseEnrollmentPanelProps) {
  const { isAuthenticated, isInitializing, accessToken } = useAuth();
  const mine = useMyEnrollments(isAuthenticated);
  const toast = useToast();
  const [submitting, setSubmitting] = useState(false);
  const enrollInFlightRef = useRef(false);
  const [created, setCreated] = useState<Enrollment | null>(null);

  const fromList = mine.enrollments?.find((item) => item.courseId === courseId) ?? null;
  const enrollment = created?.courseId === courseId ? created : fromList;

  if (isInitializing || (isAuthenticated && mine.loading && !enrollment)) {
    return <p className="page-status">Đang kiểm tra ghi danh…</p>;
  }

  if (!isAuthenticated) {
    return (
      <div className="enroll-panel">
        <Link className="button-primary" to="/login" state={{ from: `/courses/${courseId}` }}>
          {UI_COPY.signInToEnroll}
        </Link>
      </div>
    );
  }

  return (
    <div className="enroll-panel">
      {mine.error && !enrollment ? (
        <div className="section-error" role="alert">
          <p>{mine.error}</p>
          <button type="button" onClick={mine.reload}>
            {UI_COPY.tryAgain}
          </button>
        </div>
      ) : null}

      {enrollment ? <EnrollmentStatusActions enrollment={enrollment} /> : null}

      {!enrollment && !mine.error ? (
        <button
          type="button"
          className="button-primary"
          disabled={submitting || !accessToken}
          onClick={() => {
            if (!accessToken || submitting || enrollInFlightRef.current) {
              return;
            }
            enrollInFlightRef.current = true;
            setSubmitting(true);
            enrollInCourse(courseId, accessToken)
              .then((result) => {
                setCreated(result);
                toast.success(ENROLL_SUCCESS_TOAST, {
                  dedupeKey: `enroll-success-${courseId}`,
                });
              })
              .catch(async (cause: unknown) => {
                if (cause instanceof ApiError && cause.status === 409) {
                  try {
                    const list = await mine.refresh();
                    const match = list.find((item) => item.courseId === courseId);
                    if (!match) {
                      toast.error('Không xác nhận được ghi danh. Tải lại trang và thử lại.', {
                        dedupeKey: `enroll-error-${courseId}`,
                      });
                    }
                  } catch (refreshCause: unknown) {
                    toast.error(enrollmentLoadMessage(refreshCause), {
                      dedupeKey: `enroll-error-${courseId}`,
                    });
                  }
                  return;
                }
                toast.error(enrollErrorMessage(cause), {
                  dedupeKey: `enroll-error-${courseId}`,
                });
              })
              .finally(() => {
                setSubmitting(false);
                enrollInFlightRef.current = false;
              });
          }}
        >
          {submitting ? UI_COPY.enrolling : UI_COPY.enroll}
        </button>
      ) : null}
    </div>
  );
}

function EnrollmentStatusActions({ enrollment }: { enrollment: Enrollment }) {
  const { accessToken } = useAuth();
  const learn = useEnrollmentLearnTarget(enrollment, accessToken);
  const showLearnCta = enrollment.status === 'ACTIVE' || enrollment.status === 'COMPLETED';

  if (enrollment.status === 'PENDING') {
    return (
      <p className="enroll-status-label">
        Ghi danh đang chờ xử lý. Chưa thể học.
      </p>
    );
  }
  if (enrollment.status === 'DROPPED') {
    return (
      <p className="enroll-status-label">Ghi danh đã hủy. Không thể học khóa này.</p>
    );
  }

  if (!showLearnCta) {
    return null;
  }

  return (
    <div className="enroll-status">
      {enrollment.status === 'COMPLETED' ? (
        <p className="enroll-status-label">{UI_COPY.completed}</p>
      ) : (
        <p className="enroll-status-label">{UI_COPY.enrolledInCourse}</p>
      )}
      {learn.error && !learn.loading ? (
        <p className="muted enrollment-card-note">{learn.error}</p>
      ) : null}
      {learn.loading ? (
        <p className="page-status">Đang tải…</p>
      ) : learn.error ? (
        <Link className="button-secondary" to="/my-courses">
          {UI_COPY.viewMyCourses}
        </Link>
      ) : (
        <>
          {learn.noLessons ? (
            <p className="muted enrollment-card-note">Khóa học chưa có bài học.</p>
          ) : null}
          <Link
            className="button-primary"
            to={
              learn.noLessons
                ? buildLearningPath(enrollment.courseId)
                : learn.path
            }
          >
            {enrollment.status === 'COMPLETED'
              ? UI_COPY.reviewCourse
              : learn.noLessons
                ? UI_COPY.startLearning
                : learn.label}
          </Link>
          <Link className="button-secondary" to="/my-courses">
            {UI_COPY.viewMyCourses}
          </Link>
        </>
      )}
    </div>
  );
}

function enrollErrorMessage(cause: unknown): string {
  if (cause instanceof ApiError && cause.status === 401) {
    return UI_COPY.sessionExpired;
  }
  if (cause instanceof ApiError && cause.status === 400) {
    return 'Khóa học này hiện không thể ghi danh.';
  }
  if (cause instanceof ApiError) {
    return 'Ghi danh thất bại. Vui lòng thử lại sau.';
  }
  return 'Không kết nối được máy chủ. Kiểm tra mạng và thử lại.';
}
