import { Breadcrumb } from '../../../components/common/Breadcrumb';
import { UI_COPY } from '../../../ui/ui-copy';
import { breadcrumbHome, breadcrumbMyCourses } from '../../../navigation/breadcrumb-trail';
import { useAuth } from '../../auth/hooks/useAuth';
import { DashboardHeader } from '../../dashboard/components/DashboardHeader';
import { DashboardLayout } from '../../dashboard/components/DashboardLayout';
import { DashboardSidebar } from '../../dashboard/components/DashboardSidebar';
import type { Enrollment } from '../api/enrollments.api';
import { EnrollmentCourseCard } from '../components/EnrollmentCourseCard';
import { useMyEnrollments } from '../hooks/useMyEnrollments';

export function MyCoursesPage() {
  const { user } = useAuth();
  const mine = useMyEnrollments(true);

  if (!user) {
    return null;
  }

  const enrollments = mine.enrollments ?? [];
  const active = enrollments.filter((item) => item.status === 'ACTIVE');
  const completed = enrollments.filter((item) => item.status === 'COMPLETED');
  const inactive = enrollments.filter(
    (item) => item.status === 'PENDING' || item.status === 'DROPPED',
  );

  return (
    <DashboardLayout sidebar={<DashboardSidebar />} header={<DashboardHeader user={user} />}>
      <Breadcrumb items={[breadcrumbHome(), breadcrumbMyCourses()]} />
      <section className="my-courses" aria-labelledby="my-courses-heading">
        <h1 id="my-courses-heading">{UI_COPY.navMyCourses}</h1>

        {mine.loading ? <p className="page-status">Đang tải khóa học…</p> : null}

        {!mine.loading && mine.error ? (
          <div className="section-error" role="alert">
            <p>{mine.error}</p>
            <button type="button" onClick={mine.reload}>
              {UI_COPY.tryAgain}
            </button>
          </div>
        ) : null}

        {!mine.loading && !mine.error && enrollments.length === 0 ? (
          <div className="empty-state">
            <p className="empty-state-title">Bạn chưa ghi danh khóa học nào</p>
            <p className="muted">Mở khóa học đã xuất bản và ghi danh để thấy tại đây.</p>
          </div>
        ) : null}

        {!mine.loading && !mine.error && active.length > 0 ? (
          <EnrollmentGroup title="Đang học" items={active} />
        ) : null}
        {!mine.loading && !mine.error && completed.length > 0 ? (
          <EnrollmentGroup title={UI_COPY.completed} items={completed} />
        ) : null}
        {!mine.loading && !mine.error && inactive.length > 0 ? (
          <EnrollmentGroup title="Tạm không khả dụng" items={inactive} />
        ) : null}
      </section>
    </DashboardLayout>
  );
}

function EnrollmentGroup({ title, items }: { title: string; items: Enrollment[] }) {
  return (
    <section className="my-courses-group" aria-labelledby={title}>
      <h2 id={title}>{title}</h2>
      <ul className="enrollment-grid">
        {items.map((enrollment) => (
          <li key={enrollment.id}>
            <EnrollmentCourseCard enrollment={enrollment} />
          </li>
        ))}
      </ul>
    </section>
  );
}
