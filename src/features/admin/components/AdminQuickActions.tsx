import { Link } from 'react-router-dom';

export function AdminQuickActions() {
  return (
    <section className="admin-quick-actions" aria-labelledby="admin-quick-actions-heading">
      <h2 id="admin-quick-actions-heading" className="admin-overview-stats-heading">
        Thao tác nhanh
      </h2>
      <ul className="admin-quick-actions-list">
        <li>
          <Link className="admin-quick-action-card admin-quick-action-card-primary" to="/admin/courses/new">
            <span className="admin-quick-action-title">Tạo khóa học mới</span>
            <span className="muted admin-quick-action-desc">Thêm khóa học và gán giảng viên</span>
          </Link>
        </li>
        <li>
          <Link className="admin-quick-action-card" to="/admin/courses">
            <span className="admin-quick-action-title">Quản lý khóa học</span>
            <span className="muted admin-quick-action-desc">Tìm kiếm, lọc và xuất bản khóa học</span>
          </Link>
        </li>
        <li>
          <Link className="admin-quick-action-card" to="/admin/courses">
            <span className="admin-quick-action-title">Chỉnh sửa giáo trình</span>
            <span className="muted admin-quick-action-desc">
              Mở danh sách khóa học, chọn &quot;Chương trình&quot; trên từng khóa
            </span>
          </Link>
        </li>
      </ul>
    </section>
  );
}
