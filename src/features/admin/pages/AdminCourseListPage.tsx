import { useMemo, useState } from 'react';
import { Breadcrumb } from '../../../components/common/Breadcrumb';
import { breadcrumbAdminCourses, breadcrumbHome } from '../../../navigation/breadcrumb-trail';
import { useToast } from '../../../components/feedback/useToast';
import { useAuth } from '../../auth/hooks/useAuth';
import { DashboardLayout } from '../../dashboard/components/DashboardLayout';
import { DashboardSidebar } from '../../dashboard/components/DashboardSidebar';
import { useAdminCourses } from '../hooks/useAdminCourses';
import { AdminCoursesToolbar } from '../components/AdminCoursesToolbar';
import { AdminCourseTable } from '../components/AdminCourseTable';
import { AdminWorkspaceMeta } from '../components/AdminWorkspaceMeta';
import {
  countCoursesByStatus,
  filterAndSortAdminCourses,
  type AdminCourseSort,
  type AdminCourseStatusFilter,
} from '../utils/adminCourseListFilters';

export function AdminCourseListPage() {
  const { user, accessToken } = useAuth();
  const coursesState = useAdminCourses(Boolean(user?.role === 'ADMIN'));
  const toast = useToast();
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<AdminCourseStatusFilter>('all');
  const [sort, setSort] = useState<AdminCourseSort>('newest');

  const courses = coursesState.courses;
  const allCourses = courses ?? [];
  const statusCounts = useMemo(() => countCoursesByStatus(allCourses), [courses]);
  const visibleCourses = useMemo(
    () => filterAndSortAdminCourses(allCourses, query, statusFilter, sort),
    [courses, query, statusFilter, sort],
  );

  if (!user) {
    return null;
  }

  const hasCourses = allCourses.length > 0;
  const filteredEmpty = hasCourses && visibleCourses.length === 0;

  return (
    <DashboardLayout sidebar={<DashboardSidebar courseCount={allCourses.length} />}>
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
              totalCount={allCourses.length}
              publishedCount={statusCounts.published}
              draftCount={statusCounts.draft}
              query={query}
              statusFilter={statusFilter}
              sort={sort}
              onQueryChange={setQuery}
              onStatusChange={setStatusFilter}
              onSortChange={setSort}
            />

            {!hasCourses ? (
              <div className="admin-empty-panel">
                <p className="empty-state-title">Chưa có khóa học nào</p>
                <p className="muted">Tạo khóa học đầu tiên để bắt đầu.</p>
              </div>
            ) : null}

            {hasCourses && filteredEmpty ? (
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

            {hasCourses && !filteredEmpty ? (
              <AdminCourseTable
                courses={visibleCourses}
                accessToken={accessToken}
                onPublishedChange={() => coursesState.refresh()}
                onPublishError={(message) => toast.error(message)}
                onPublishSuccess={(message) => toast.success(message)}
              />
            ) : null}
          </>
        ) : null}
      </section>
    </DashboardLayout>
  );
}
