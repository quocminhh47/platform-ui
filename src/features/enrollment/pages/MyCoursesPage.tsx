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
      <section className="my-courses" aria-labelledby="my-courses-heading">
        <h1 id="my-courses-heading">My courses</h1>

        {mine.loading ? <p className="page-status">Loading your courses…</p> : null}

        {!mine.loading && mine.error ? (
          <div className="section-error" role="alert">
            <p>{mine.error}</p>
            <button type="button" onClick={mine.reload}>
              Try again
            </button>
          </div>
        ) : null}

        {!mine.loading && !mine.error && enrollments.length === 0 ? (
          <div className="empty-state">
            <p className="empty-state-title">You are not enrolled in any courses yet</p>
            <p className="muted">Open a published course and enroll to see it here.</p>
          </div>
        ) : null}

        {!mine.loading && !mine.error && active.length > 0 ? (
          <EnrollmentGroup title="In progress" items={active} />
        ) : null}
        {!mine.loading && !mine.error && completed.length > 0 ? (
          <EnrollmentGroup title="Completed" items={completed} />
        ) : null}
        {!mine.loading && !mine.error && inactive.length > 0 ? (
          <EnrollmentGroup title="Not currently available" items={inactive} />
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
