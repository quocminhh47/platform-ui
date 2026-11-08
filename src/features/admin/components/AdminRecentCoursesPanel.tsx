import { Link } from 'react-router-dom';
import { formatPrice } from '../../catalog/utils/formatPrice';
import type { Course } from '../../catalog/types/course.types';
import { adminCurriculumIndicator } from '../utils/adminDashboardMetrics';
import { formatAdminDateTime } from '../utils/formatAdminDateTime';
type AdminRecentCoursesPanelProps = {
  courses: Course[];
};

export function AdminRecentCoursesPanel({ courses }: AdminRecentCoursesPanelProps) {
  const recent = courses;

  if (recent.length === 0) {
    return (
      <section className="admin-recent-courses" aria-labelledby="admin-recent-courses-heading">
        <h2 id="admin-recent-courses-heading" className="admin-overview-stats-heading">
          Khóa học gần đây
        </h2>
        <p className="muted">Chưa có khóa học nào để hiển thị.</p>
      </section>
    );
  }

  return (
    <section className="admin-recent-courses" aria-labelledby="admin-recent-courses-heading">
      <div className="admin-recent-courses-header">
        <h2 id="admin-recent-courses-heading" className="admin-overview-stats-heading">
          Khóa học gần đây
        </h2>
        <Link className="admin-btn admin-btn-ghost" to="/admin/courses">
          Xem tất cả
        </Link>
      </div>
      <ul className="admin-recent-courses-list">
        {recent.map((course) => {
          const curriculum = adminCurriculumIndicator(course.lessonCount);
          return (
            <li key={course.id} className="admin-recent-course-item">
              <div className="admin-recent-course-main">
                <Link className="admin-recent-course-title" to={`/admin/courses/${course.id}`}>
                  {course.title}
                </Link>
                <p className="muted admin-recent-course-meta">
                  {formatPrice(course.price)} · Cập nhật {formatAdminDateTime(course.updatedAt)}
                </p>
              </div>
              <div className="admin-recent-course-badges">
                <span
                  className={
                    course.published
                      ? 'admin-status-badge admin-status-badge--published'
                      : 'admin-status-badge admin-status-badge--draft'
                  }
                >
                  {course.published ? 'Đã xuất bản' : 'Chưa xuất bản'}
                </span>
                <span
                  className={`admin-curriculum-chip admin-curriculum-chip--${curriculum.tone}`}
                >
                  {curriculum.primary}
                </span>
              </div>
              <Link
                className="admin-btn admin-btn-outline-primary"
                to={`/admin/courses/${course.id}/curriculum`}
              >
                Giáo trình
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
