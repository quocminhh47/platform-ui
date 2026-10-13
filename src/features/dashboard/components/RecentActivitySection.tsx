import { EmptyState } from './EmptyState';

export function RecentActivitySection() {
  return (
    <section className="dashboard-section" aria-labelledby="activity-heading">
      <h2 id="activity-heading">Recent activity</h2>
      <EmptyState
        title="No recent activity"
        description="Activity will show up here once enrollments and lesson progress are available."
      />
    </section>
  );
}
