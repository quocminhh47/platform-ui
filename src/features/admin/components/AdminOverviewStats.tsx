import type { CourseMetrics } from '../api/admin-metrics.api';

type AdminOverviewStatsProps = {
  courseMetrics: CourseMetrics | null;
  coursesLoading: boolean;
  coursesError: string | null;
  onRetryCourses: () => void;
  studentCount: number | null;
  studentsLoading: boolean;
  studentsError: string | null;
  onRetryStudents: () => void;
};

export function AdminOverviewStats({
  courseMetrics,
  coursesLoading,
  coursesError,
  onRetryCourses,
  studentCount,
  studentsLoading,
  studentsError,
  onRetryStudents,
}: AdminOverviewStatsProps) {
  const showCourseGrid = !coursesLoading && !coursesError && courseMetrics;

  return (
    <section className="admin-overview-stats" aria-labelledby="admin-overview-stats-heading">
      <h2 id="admin-overview-stats-heading" className="admin-overview-stats-heading">
        Tổng quan nội dung
      </h2>

      {coursesLoading ? (
        <p className="page-status admin-overview-stats-status">Đang tải thống kê…</p>
      ) : null}

      {!coursesLoading && coursesError ? (
        <div className="section-error admin-overview-stats-error" role="alert">
          <p>{coursesError}</p>
          <div className="admin-overview-stats-retry-row">
            <button type="button" className="admin-btn admin-btn-secondary" onClick={onRetryCourses}>
              Thử lại thống kê khóa học
            </button>
          </div>
        </div>
      ) : null}

      {showCourseGrid ? (
        <ul className="admin-stat-grid admin-stat-grid-overview">
          <AdminStatCard label="Tổng khóa học" value={courseMetrics.total} />
          <AdminStatCard label="Đã xuất bản" value={courseMetrics.published} />
          <AdminStatCard label="Chưa xuất bản" value={courseMetrics.draft} />
          <AdminStatCard label="Có bài học" value={courseMetrics.withLessons} hint="Theo số bài từ API" />
          <AdminStudentStatCard
            count={studentCount}
            loading={studentsLoading}
            error={studentsError}
            onRetry={onRetryStudents}
          />
        </ul>
      ) : null}
    </section>
  );
}

function AdminStatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: number;
  hint?: string;
}) {
  return (
    <li className="admin-stat-card">
      <p className="admin-stat-label">{label}</p>
      <p className="admin-stat-value">{value}</p>
      {hint ? <p className="muted admin-stat-hint">{hint}</p> : null}
    </li>
  );
}

function AdminStudentStatCard({
  count,
  loading,
  error,
  onRetry,
}: {
  count: number | null;
  loading: boolean;
  error: string | null;
  onRetry: () => void;
}) {
  const hint = 'Vai trò học viên · không tính lượt ghi danh khóa học';

  return (
    <li className="admin-stat-card">
      <p className="admin-stat-label">Tài khoản học viên đang hoạt động</p>
      {loading ? <p className="page-status admin-stat-inline-status">Đang tải…</p> : null}
      {!loading && error ? (
        <>
          <p className="admin-stat-error" role="alert">
            {error}
          </p>
          <button type="button" className="admin-btn admin-btn-secondary admin-stat-retry" onClick={onRetry}>
            Thử lại thống kê học viên
          </button>
        </>
      ) : null}
      {!loading && !error && count !== null ? (
        <>
          <p className="admin-stat-value">{count}</p>
          <p className="muted admin-stat-hint">{hint}</p>
        </>
      ) : null}
    </li>
  );
}
