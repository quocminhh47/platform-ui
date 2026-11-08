import type { Enrollment } from '../../enrollment/api/enrollments.api';

type DashboardStatsProps = {
  enrollments: Enrollment[] | null;
  loading: boolean;
  error: string | null;
};

export function DashboardStats({ enrollments, loading, error }: DashboardStatsProps) {
  if (loading) {
    return (
      <section className="dashboard-section" aria-labelledby="stats-heading">
        <h2 id="stats-heading">Tổng quan học tập</h2>
        <p className="page-status" style={{ padding: '0.5rem 0' }}>Đang tải…</p>
      </section>
    );
  }

  // Show a muted notice rather than zeros when the API failed.
  // Zeros are misleading: the student may have enrollments we simply could not load.
  if (error) {
    return (
      <section className="dashboard-section" aria-labelledby="stats-heading">
        <h2 id="stats-heading">Tổng quan học tập</h2>
        <p className="muted">Không tải được thống kê. Vui lòng thử lại sau.</p>
      </section>
    );
  }

  const list = enrollments ?? [];
  const enrolled = list.length;
  const active = list.filter((e) => e.status === 'ACTIVE').length;
  const completed = list.filter((e) => e.status === 'COMPLETED').length;

  const stats = [
    { label: 'Khóa đã ghi danh', value: enrolled },
    { label: 'Đang học', value: active },
    { label: 'Đã hoàn thành', value: completed },
  ];

  return (
    <section className="dashboard-section" aria-labelledby="stats-heading">
      <h2 id="stats-heading">Tổng quan học tập</h2>
      <ul className="stat-grid">
        {stats.map((item) => (
          <li key={item.label} className="stat-card">
            <p className="stat-label">{item.label}</p>
            <p className="stat-value">{item.value}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
