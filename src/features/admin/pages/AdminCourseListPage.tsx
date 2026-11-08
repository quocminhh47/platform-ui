import { useEffect, useState } from 'react';
import { Breadcrumb } from '../../../components/common/Breadcrumb';
import { PaginationControls } from '../../../components/common/PaginationControls';
import { breadcrumbAdminCourses, breadcrumbHome } from '../../../navigation/breadcrumb-trail';
import { useToast } from '../../../components/feedback/useToast';
import { useAuth } from '../../auth/hooks/useAuth';
import { DashboardLayout } from '../../dashboard/components/DashboardLayout';
import { DashboardSidebar } from '../../dashboard/components/DashboardSidebar';
import { useAdminCourseMetrics } from '../hooks/useAdminCourseMetrics';
import { useAdminCourses } from '../hooks/useAdminCourses';
import { AdminCoursesToolbar } from '../components/AdminCoursesToolbar';
import { AdminCourseTable } from '../components/AdminCourseTable';
import { AdminWorkspaceMeta } from '../components/AdminWorkspaceMeta';
import type { AdminCourseSort, AdminCourseStatusFilter } from '../utils/adminCourseListFilters';

export function AdminCourseListPage() {
  const { user, accessToken } = useAuth();
  const metricsState = useAdminCourseMetrics(Boolean(user?.role === 'ADMIN'));
  const toast = useToast();
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<AdminCourseStatusFilter>('all');
  const [sort, setSort] = useState<AdminCourseSort>('newest');
  const [page, setPage] = useState(0);

  useEffect(() => {
    setPage(0);
  }, [query, statusFilter, sort]);

  const coursesState = useAdminCourses(Boolean(user?.role === 'ADMIN'), {
    q: query,
    status: statusFilter,
    sort,
    page,
    size: 20,
  });

  const pageData = coursesState.page;
  const visibleCourses = pageData?.content ?? [];
  const totalCount = metricsState.metrics?.total ?? pageData?.totalElements ?? 0;
  const publishedCount = metricsState.metrics?.published ?? 0;
  const draftCount = metricsState.metrics?.draft ?? 0;

  if (!user) {
    return null;
  }

  const hasAnyCourses = totalCount > 0;
  const filteredEmpty = hasAnyCourses && !coursesState.loading && visibleCourses.length === 0;

  return (
    <DashboardLayout sidebar={<DashboardSidebar courseCount={totalCount} />}>
      <section className="admin-courses admin-workspace-page" aria-labelledby="admin-courses-heading">
        <div className="admin-workspace-top">
          <Breadcrumb items={[breadcrumbHome(), breadcrumbAdminCourses()]} />
          <AdminWorkspaceMeta user={user} />
        </div>

        {coursesState.loading ? (
          <p className="page-status">Đang tải danh sách khóa học…</p>
        ) : null}

        {!coursesState.loading && coursesState.error ? (
          <div className="section-error" role="alert">
            <p>{coursesState.error}</p>
            <button type="button" className="admin-btn admin-btn-secondary" onClick={coursesState.reload}>
              Thử lại
            </button>
          </div>
        ) : null}

        {!coursesState.loading && !coursesState.error ? (
          <>
            <AdminCoursesToolbar
              totalCount={totalCount}
              visibleCount={pageData?.totalElements ?? visibleCourses.length}
              publishedCount={publishedCount}
              draftCount={draftCount}
              query={query}
              statusFilter={statusFilter}
              sort={sort}
              onQueryChange={setQuery}
              onStatusChange={setStatusFilter}
              onSortChange={setSort}
            />

            {!hasAnyCourses ? (
              <div className="admin-empty-panel">
                <p className="empty-state-title">Chưa có khóa học nào</p>
                <p className="muted">Tạo khóa học đầu tiên để bắt đầu.</p>
              </div>
            ) : null}

            {hasAnyCourses && filteredEmpty ? (
              <div className="admin-empty-panel admin-empty-panel-compact">
                <p className="empty-state-title">Không có khóa học phù hợp</p>
                <p className="muted">Thử đổi từ khóa tìm kiếm hoặc bộ lọc trạng thái.</p>
                <button
                  type="button"
                  className="admin-btn admin-btn-secondary"
                  onClick={() => {
                    setQuery('');
                    setStatusFilter('all');
                  }}
                >
                  Xóa bộ lọc
                </button>
              </div>
            ) : null}

            {hasAnyCourses && visibleCourses.length > 0 ? (
              <>
                <AdminCourseTable
                  courses={visibleCourses}
                  accessToken={accessToken}
                  onPublishedChange={async () => {
                    await coursesState.refresh();
                    metricsState.reload();
                  }}
                  onPublishError={(message) => toast.error(message)}
                  onPublishSuccess={(message) => toast.success(message)}
                />
                {pageData ? (
                  <PaginationControls
                    page={pageData.page}
                    totalPages={pageData.totalPages}
                    totalElements={pageData.totalElements}
                    disabled={coursesState.loading}
                    onPageChange={setPage}
                    label="Trang khóa học"
                  />
                ) : null}
              </>
            ) : null}
          </>
        ) : null}
      </section>
    </DashboardLayout>
  );
}
