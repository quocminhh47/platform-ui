import { Link } from 'react-router-dom';
import type { AdminCourseSort, AdminCourseStatusFilter } from '../utils/adminCourseListFilters';

type AdminCoursesToolbarProps = {
  totalCount: number;
  publishedCount: number;
  draftCount: number;
  query: string;
  statusFilter: AdminCourseStatusFilter;
  sort: AdminCourseSort;
  onQueryChange: (value: string) => void;
  onStatusChange: (value: AdminCourseStatusFilter) => void;
  onSortChange: (value: AdminCourseSort) => void;
};

export function AdminCoursesToolbar({
  totalCount,
  publishedCount,
  draftCount,
  query,
  statusFilter,
  sort,
  onQueryChange,
  onStatusChange,
  onSortChange,
}: AdminCoursesToolbarProps) {
  return (
    <section className="admin-courses-panel" aria-labelledby="admin-courses-heading">
      <div className="admin-courses-panel-top">
        <div className="admin-courses-title-row">
          <h1 id="admin-courses-heading">Quản lý khóa học</h1>
          <span className="admin-courses-count-badge">
            {totalCount} khóa học
          </span>
        </div>
        <Link className="admin-btn admin-btn-primary" to="/admin/courses/new">
          <span aria-hidden="true">+</span>
          Tạo khóa học mới
        </Link>
      </div>

      <div className="admin-courses-filters">
        <label className="admin-search-field">
          <span className="visually-hidden">Tìm kiếm khóa học</span>
          <span className="admin-search-icon" aria-hidden="true">⌕</span>
          <input
            type="search"
            value={query}
            placeholder="Tìm kiếm tên khóa học, giảng viên…"
            onChange={(event) => onQueryChange(event.target.value)}
          />
        </label>
        <div className="admin-courses-filter-group">
          <label className="admin-select-wrap">
            <span className="visually-hidden">Lọc trạng thái</span>
            <select
              value={statusFilter}
              onChange={(event) =>
                onStatusChange(event.target.value as AdminCourseStatusFilter)
              }
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="published">Đã xuất bản ({publishedCount})</option>
              <option value="draft">Chưa xuất bản ({draftCount})</option>
            </select>
          </label>
          <label className="admin-select-wrap">
            <span className="visually-hidden">Sắp xếp</span>
            <select
              value={sort}
              onChange={(event) => onSortChange(event.target.value as AdminCourseSort)}
            >
              <option value="newest">Mới nhất</option>
              <option value="oldest">Cũ nhất</option>
              <option value="lessons">Số lượng bài học</option>
            </select>
          </label>
        </div>
      </div>
    </section>
  );
}
