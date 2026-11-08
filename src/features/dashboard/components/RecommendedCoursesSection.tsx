import { Link } from 'react-router-dom';
import { UI_COPY } from '../../../ui/ui-copy';
import { CourseListing } from '../../catalog/components/CourseListing';
import type { PublishedCoursesState } from '../../catalog/hooks/usePublishedCourses';

type RecommendedCoursesSectionProps = {
  state: PublishedCoursesState;
};

export function RecommendedCoursesSection({ state }: RecommendedCoursesSectionProps) {
  return (
    <section className="dashboard-section" aria-labelledby="explore-heading">
      <div className="section-heading">
        <h2 id="explore-heading">Khóa học đã xuất bản</h2>
        <p className="muted">
          Cùng danh mục với <Link to="/courses">{UI_COPY.navExploreCourses}</Link>.
        </p>
      </div>
      <CourseListing
        state={state}
        emptyTitle="Chưa có khóa học đã xuất bản"
        emptyDescription="Khi quản trị viên xuất bản khóa học, chúng sẽ xuất hiện tại đây."
      />
    </section>
  );
}
