import { Breadcrumb } from '../../../components/common/Breadcrumb';
import { breadcrumbDashboard, breadcrumbHome } from '../../../navigation/breadcrumb-trail';
import { useAuth } from '../../auth/hooks/useAuth';
import { ContinueLearningSection } from '../components/ContinueLearningSection';
import { DashboardHeader } from '../components/DashboardHeader';
import { DashboardLayout } from '../components/DashboardLayout';
import { DashboardSidebar } from '../components/DashboardSidebar';
import { LearningStats } from '../components/LearningStats';
import { RecentActivitySection } from '../components/RecentActivitySection';
import { RecommendedCoursesSection } from '../components/RecommendedCoursesSection';
import { WelcomeSection } from '../components/WelcomeSection';
import { usePublishedCourses } from '../../catalog/hooks/usePublishedCourses';

export function DashboardPage() {
  const { user } = useAuth();
  const courses = usePublishedCourses();

  if (!user) {
    return null;
  }

  return (
    <DashboardLayout sidebar={<DashboardSidebar />} header={<DashboardHeader user={user} />}>
      <Breadcrumb items={[breadcrumbHome(), breadcrumbDashboard()]} />
      <WelcomeSection name={user.fullName} />
      <LearningStats />
      <div className="dashboard-split">
        <ContinueLearningSection />
        <RecentActivitySection />
      </div>
      <RecommendedCoursesSection state={courses} />
    </DashboardLayout>
  );
}
