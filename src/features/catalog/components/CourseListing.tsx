import { Link } from 'react-router-dom';
import type { PublishedCoursesState } from '../hooks/usePublishedCourses';
import { CourseCard } from './CourseCard';

type CourseListingProps = {
  state: PublishedCoursesState;
  emptyTitle: string;
  emptyDescription: string;
  /** Show only the first N courses returned by the API, in that order. */
  limit?: number;
};

export function CourseListing({
  state,
  emptyTitle,
  emptyDescription,
  limit,
}: CourseListingProps) {
  const { courses, loading, error, reload } = state;
  const visible = courses && limit !== undefined ? courses.slice(0, limit) : courses;
  const hiddenCount = courses && visible ? courses.length - visible.length : 0;

  return (
    <div className="course-listing">
      {loading ? <p className="page-status">Loading courses…</p> : null}

      {!loading && error ? (
        <div className="section-error" role="alert">
          <p>{error}</p>
          <button type="button" onClick={reload}>
            Try again
          </button>
        </div>
      ) : null}

      {!loading && !error && courses && courses.length === 0 ? (
        <div className="empty-state">
          <p className="empty-state-title">{emptyTitle}</p>
          <p className="muted">{emptyDescription}</p>
        </div>
      ) : null}

      {!loading && !error && visible && visible.length > 0 ? (
        <>
          <ul className="course-grid">
            {visible.map((course) => (
              <li key={course.id}>
                <CourseCard course={course} />
              </li>
            ))}
          </ul>
          {hiddenCount > 0 ? (
            <p className="listing-more">
              <Link to="/courses">See all {courses?.length} courses</Link>
            </p>
          ) : null}
        </>
      ) : null}
    </div>
  );
}
