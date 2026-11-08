import { Breadcrumb } from '../../../components/common/Breadcrumb';
import { breadcrumbAdminOverview, breadcrumbHome } from '../../../navigation/breadcrumb-trail';
import { useAuth } from '../../auth/hooks/useAuth';
import { DashboardLayout } from '../../dashboard/components/DashboardLayout';
import { DashboardSidebar } from '../../dashboard/components/DashboardSidebar';
import { AdminDashboardHeader } from '../components/AdminDashboardHeader';
import { AdminOverviewStats } from '../components/AdminOverviewStats';
import { AdminQuickActions } from '../components/AdminQuickActions';
import { AdminRecentCoursesPanel } from '../components/AdminRecentCoursesPanel';
import { AdminWorkspaceMeta } from '../components/AdminWorkspaceMeta';
import { useAdminCourseMetrics } from '../hooks/useAdminCourseMetrics';
import { useAdminCourses } from '../hooks/useAdminCourses';
import { useAdminStudentCount } from '../hooks/useAdminStudentCount';

const RECENT_COURSES_QUERY = {
  q: '',
  status: 'all' as const,
  sort: 'newest' as const,
  page: 0,
  size: 5,
};

export function AdminDashboardPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';
  const metricsState = useAdminCourseMetrics(isAdmin);
  const studentsState = useAdminStudentCount(isAdmin);
  const recentState = useAdminCourses(isAdmin, RECENT_COURSES_QUERY);
  const courseCount = metricsState.metrics?.total;

  if (!user) {
    return null;
  }

  const recentCourses = recentState.page?.content ?? null;

  return (
    <DashboardLayout
      sidebar={<DashboardSidebar courseCount={courseCount} />}
      header={<AdminDashboardHeader user={user} />}
    >
      <section className="admin-dashboard admin-workspace-page" aria-labelledby="admin-dashboard-heading">
        <div className="admin-workspace-top">
          <Breadcrumb items={[breadcrumbHome(), breadcrumbAdminOverview()]} />
          <AdminWorkspaceMeta user={user} />
        </div>
        <header className="admin-page-header">
          <h1 id="admin-dashboard-heading">Tổng quan quản trị</h1>
        </header>

        <AdminOverviewStats
          courseMetrics={metricsState.metrics}
          coursesLoading={metricsState.loading}
          coursesError={metricsState.error}
          onRetryCourses={metricsState.reload}
          studentCount={studentsState.count}
          studentsLoading={studentsState.loading}
          studentsError={studentsState.error}
          onRetryStudents={studentsState.reload}
        />

        <AdminQuickActions />

        {!recentState.loading && !recentState.error && recentCourses ? (
          <AdminRecentCoursesPanel courses={recentCourses} />
        ) : null}
      </section>
    </DashboardLayout>
  );
}
