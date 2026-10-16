import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useToast } from '../../../components/feedback/useToast';
import { ApiError } from '../../../services/api/api-error';
import { useAuth } from '../../auth/hooks/useAuth';
import { enrollInCourse } from '../api/enrollments.api';
import type { Enrollment } from '../api/enrollments.api';
import { ENROLL_SUCCESS_TOAST } from '../enrollment-messages';
import { enrollmentLoadMessage, useMyEnrollments } from '../hooks/useMyEnrollments';

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
    return <p className="page-status">Checking enrollment…</p>;
  }

  if (!isAuthenticated) {
    return (
      <div className="enroll-panel">
        <Link className="button-primary" to="/login" state={{ from: `/courses/${courseId}` }}>
          Sign in to enroll
        </Link>
      </div>
    );
  }

  return (
    <div className="enroll-panel">
      {mine.error ? (
        <div className="section-error" role="alert">
          <p>{mine.error}</p>
          <button type="button" onClick={mine.reload}>
            Try again
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
                      toast.error(
                        'Enrollment could not be confirmed. Refresh and try again.',
                        { dedupeKey: `enroll-error-${courseId}` },
                      );
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
          {submitting ? 'Enrolling…' : 'Enroll'}
        </button>
      ) : null}
    </div>
  );
}

function EnrollmentStatusActions({ enrollment }: { enrollment: Enrollment }) {
  if (enrollment.status === 'ACTIVE') {
    return (
      <Link className="button-primary" to={`/courses/${enrollment.courseId}/learn`}>
        Start learning
      </Link>
    );
  }
  if (enrollment.status === 'COMPLETED') {
    return (
      <div className="enroll-status">
        <p className="enroll-status-label">Completed</p>
        <Link className="button-primary" to={`/courses/${enrollment.courseId}/learn`}>
          Review course
        </Link>
      </div>
    );
  }
  if (enrollment.status === 'PENDING') {
    return <p className="enroll-status-label">Enrollment pending. Learning is not available yet.</p>;
  }
  return <p className="enroll-status-label">This enrollment is dropped. Learning is not available.</p>;
}

function enrollErrorMessage(cause: unknown): string {
  if (cause instanceof ApiError && cause.status === 401) {
    return 'Your session has expired. Sign in again.';
  }
  if (cause instanceof ApiError && cause.status === 400) {
    return 'This course cannot be enrolled in right now.';
  }
  if (cause instanceof ApiError) {
    return 'Enrollment failed. Try again in a moment.';
  }
  return 'Unable to reach the server. Check your connection and try again.';
}
