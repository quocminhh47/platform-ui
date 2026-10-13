import { Link } from 'react-router-dom';
import { CourseListing } from '../../catalog/components/CourseListing';
import type { PublishedCoursesState } from '../../catalog/hooks/usePublishedCourses';

type RecommendedCoursesSectionProps = {
  state: PublishedCoursesState;
};

export function RecommendedCoursesSection({ state }: RecommendedCoursesSectionProps) {
  return (
    <section className="dashboard-section" aria-labelledby="explore-heading">
      <div className="section-heading">
        <h2 id="explore-heading">Published courses</h2>
        <p className="muted">
          The same catalog as <Link to="/courses">Explore courses</Link>.
        </p>
      </div>
      <CourseListing
        state={state}
        emptyTitle="No published courses"
        emptyDescription="When an administrator publishes a course, it will appear here."
      />
    </section>
  );
}
