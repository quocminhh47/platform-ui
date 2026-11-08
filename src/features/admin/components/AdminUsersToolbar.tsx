import type {
  AdminUserRoleFilter,
  AdminUserSort,
  AdminUserStatusFilter,
} from '../utils/adminUserListFilters';
import { adminUserRoleLabel } from '../utils/adminUserRoleLabels';

type AdminUsersToolbarProps = {
  totalCount: number;
  visibleCount: number;
  activeCount: number;
  inactiveCount: number;
  query: string;
  roleFilter: AdminUserRoleFilter;
  statusFilter: AdminUserStatusFilter;
  sort: AdminUserSort;
  onQueryChange: (value: string) => void;
  onRoleChange: (value: AdminUserRoleFilter) => void;
  onStatusChange: (value: AdminUserStatusFilter) => void;
  onSortChange: (value: AdminUserSort) => void;
  onCreateClick: () => void;
};

export function AdminUsersToolbar({
  totalCount,
  visibleCount,
  activeCount,
  inactiveCount,
  query,
  roleFilter,
  statusFilter,
  sort,
  onQueryChange,
  onRoleChange,
  onStatusChange,
  onSortChange,
  onCreateClick,
}: AdminUsersToolbarProps) {
  return (
    <section className="admin-courses-panel admin-users-panel" aria-labelledby="admin-users-heading">
      <div className="admin-courses-panel-top">
        <div className="admin-courses-title-row">
          <h1 id="admin-users-heading">Quản lý người dùng</h1>
          <span className="admin-courses-count-badge">{totalCount} tài khoản</span>
        </div>
        <button type="button" className="admin-btn admin-btn-primary" onClick={onCreateClick}>
          <span aria-hidden="true">+</span>
          Tạo người dùng
        </button>
      </div>

      <p className="admin-courses-results-meta muted">
        {visibleCount === totalCount
          ? `Hiển thị ${totalCount} tài khoản`
          : `Hiển thị ${visibleCount} / ${totalCount} tài khoản`}
      </p>

      <div className="admin-courses-filters">
        <label className="admin-search-field">
          <span className="visually-hidden">Tìm kiếm người dùng</span>
          <span className="admin-search-icon" aria-hidden="true">
            ⌕
          </span>
          <input
            type="search"
            value={query}
            placeholder="Tìm theo họ tên, email, số điện thoại…"
            onChange={(event) => onQueryChange(event.target.value)}
          />
        </label>
        <div className="admin-courses-filter-group">
          <label className="admin-select-wrap">
            <span className="visually-hidden">Lọc vai trò</span>
            <select
              value={roleFilter}
              onChange={(event) => onRoleChange(event.target.value as AdminUserRoleFilter)}
            >
              <option value="all">Tất cả vai trò</option>
              <option value="STUDENT">{adminUserRoleLabel('STUDENT')}</option>
              <option value="INSTRUCTOR">{adminUserRoleLabel('INSTRUCTOR')}</option>
              <option value="ADMIN">{adminUserRoleLabel('ADMIN')}</option>
            </select>
          </label>
          <label className="admin-select-wrap">
            <span className="visually-hidden">Lọc trạng thái</span>
            <select
              value={statusFilter}
              onChange={(event) => onStatusChange(event.target.value as AdminUserStatusFilter)}
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="active">Đang hoạt động ({activeCount})</option>
              <option value="inactive">Ngưng hoạt động ({inactiveCount})</option>
            </select>
          </label>
          <label className="admin-select-wrap">
            <span className="visually-hidden">Sắp xếp</span>
            <select
              value={sort}
              onChange={(event) => onSortChange(event.target.value as AdminUserSort)}
            >
              <option value="newest">Mới nhất</option>
              <option value="oldest">Cũ nhất</option>
              <option value="name">Họ tên (A–Z)</option>
            </select>
          </label>
        </div>
      </div>
    </section>
  );
}
