import { Link } from 'react-router-dom';
import type { CourseProgressSummary } from '../types/progress.types';

type CourseCompleteCalloutProps = {
  courseSummary: CourseProgressSummary;
  /** True while the progress API request is in-flight. */
  progressLoading: boolean;
  /**
   * Non-null when the progress request failed. The callout must not appear
   * when progress data is unavailable — completion cannot be confirmed.
   */
  progressError: string | null;
  courseTitle?: string;
};

export function CourseCompleteCallout({
  courseSummary,
  progressLoading,
  progressError,
  courseTitle,
}: CourseCompleteCalloutProps) {
  // Never show while data is in-flight or unavailable.
  if (progressLoading || progressError) {
    return null;
  }
  // totalCount === 0 covers two cases:
  //   (a) the course genuinely has no lessons — not "complete"
  //   (b) the curriculum is still loading (sections are null) — not yet known
  if (
    courseSummary.totalCount === 0 ||
    courseSummary.completedCount < courseSummary.totalCount
  ) {
    return null;
  }

  return (
    <div className="course-complete-callout" role="status">
      <span className="course-complete-callout-icon" aria-hidden="true">🎉</span>
      <div className="course-complete-callout-body">
        <strong>Chúc mừng!</strong>
        {courseTitle ? (
          <p>Bạn đã hoàn thành tất cả bài học trong <em>{courseTitle}</em>.</p>
        ) : (
          <p>Bạn đã hoàn thành tất cả bài học trong khóa học này.</p>
        )}
      </div>
      <Link to="/my-courses" className="button-primary course-complete-callout-action">
        Xem khóa học của tôi
      </Link>
    </div>
  );
}
