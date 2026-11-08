import { Breadcrumb } from '../../../components/common/Breadcrumb';
import { breadcrumbDashboard, breadcrumbHome } from '../../../navigation/breadcrumb-trail';
import { useAuth } from '../../auth/hooks/useAuth';
import { ContinueLearningSection } from '../components/ContinueLearningSection';
import { DashboardHeader } from '../components/DashboardHeader';
import { DashboardLayout } from '../components/DashboardLayout';
import { DashboardSidebar } from '../components/DashboardSidebar';
import { DashboardStats } from '../components/DashboardStats';
import { RecentActivitySection } from '../components/RecentActivitySection';
import { RecommendedCoursesSection } from '../components/RecommendedCoursesSection';
import { WelcomeSection } from '../components/WelcomeSection';
import { usePublishedCourses } from '../../catalog/hooks/usePublishedCourses';
import { useMyEnrollments } from '../../enrollment/hooks/useMyEnrollments';

export function DashboardPage() {
  const { user, isAuthenticated } = useAuth();
  const courses = usePublishedCourses();
  const mine = useMyEnrollments(isAuthenticated);

  if (!user) {
    return null;
  }

  return (
    <DashboardLayout sidebar={<DashboardSidebar />} header={<DashboardHeader user={user} />}>
      <Breadcrumb items={[breadcrumbHome(), breadcrumbDashboard()]} />
      <WelcomeSection name={user.fullName} enrollments={mine.enrollments} />
      <DashboardStats
        enrollments={mine.enrollments}
        loading={mine.loading}
        error={mine.error}
      />
      <div className="dashboard-split">
        <ContinueLearningSection
          enrollments={mine.enrollments}
          enrollmentsLoading={mine.loading}
          enrollmentsError={mine.error}
          onRetry={mine.reload}
        />
        <RecentActivitySection />
      </div>
      <RecommendedCoursesSection state={courses} />
    </DashboardLayout>
  );
}
