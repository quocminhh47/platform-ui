import { EmptyState } from './EmptyState';

export function RecentActivitySection() {
  return (
    <section className="dashboard-section" aria-labelledby="activity-heading">
      <h2 id="activity-heading">Hoạt động gần đây</h2>
      <EmptyState
        title="Chưa có hoạt động"
        description="Hoạt động sẽ hiển thị tại đây khi bạn ghi danh và học bài."
      />
    </section>
  );
}
