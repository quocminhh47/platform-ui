import { useRef, useState } from 'react';
import type { User } from '../../auth/types/auth.types';
import { formatAdminDateTime } from '../utils/formatAdminDateTime';
import { instructorInitials } from '../utils/adminCourseListFilters';
import { adminUserRoleLabel } from '../utils/adminUserRoleLabels';
import { confirmDeactivateUser } from '../utils/admin-user-confirmations';

type AdminUserTableProps = {
  users: User[];
  currentAdminId: string;
  accessToken: string | null;
  onEdit: (user: User) => void;
  onToggleActive: (user: User) => Promise<void>;
  onToggleError: (message: string) => void;
};

export function AdminUserTable({
  users,
  currentAdminId,
  accessToken,
  onEdit,
  onToggleActive,
  onToggleError,
}: AdminUserTableProps) {
  const [busyId, setBusyId] = useState<string | null>(null);
  const inFlightRef = useRef<string | null>(null);

  async function handleToggleActive(user: User) {
    if (!accessToken || busyId || inFlightRef.current) {
      return;
    }
    if (user.id === currentAdminId) {
      onToggleError('Bạn không thể thay đổi trạng thái tài khoản của chính mình tại đây.');
      return;
    }
    if (user.active && !confirmDeactivateUser(user.fullName)) {
      return;
    }
    inFlightRef.current = user.id;
    setBusyId(user.id);
    try {
      await onToggleActive(user);
    } catch {
      /* toast from page */
    } finally {
      inFlightRef.current = null;
      setBusyId(null);
    }
  }

  return (
    <div className="admin-courses-table-panel">
      <div className="admin-table-wrap admin-table-wrap--courses">
        <table className="admin-table admin-table--courses admin-table--users">
          <caption className="visually-hidden">Danh sách người dùng</caption>
          <thead>
            <tr>
              <th scope="col">Người dùng</th>
              <th scope="col">Vai trò</th>
              <th scope="col" className="admin-table-col-center">
                Trạng thái
              </th>
              <th scope="col" className="admin-table-col-date">
                Ngày tạo
              </th>
              <th scope="col" className="admin-table-col-actions">
                Thao tác
              </th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className={user.active ? undefined : 'admin-table-row-draft'}>
                <td data-label="Người dùng">
                  <div className="admin-instructor-cell admin-user-cell">
                    <span className="admin-instructor-avatar" aria-hidden="true">
                      {instructorInitials(user.fullName)}
                    </span>
                    <div>
                      <p className="admin-user-name">{user.fullName}</p>
                      <p className="muted admin-user-email">{user.email}</p>
                    </div>
                  </div>
                </td>
                <td data-label="Vai trò">
                  <span className="admin-user-role-badge">{adminUserRoleLabel(user.role)}</span>
                </td>
                <td data-label="Trạng thái" className="admin-table-col-center">
                  <span
                    className={
                      user.active
                        ? 'admin-status-badge admin-status-badge--published'
                        : 'admin-status-badge admin-status-badge--draft'
                    }
                  >
                    <span className="admin-status-dot" aria-hidden="true" />
                    {user.active ? 'Đang hoạt động' : 'Ngưng hoạt động'}
                  </span>
                </td>
                <td data-label="Ngày tạo" className="admin-table-col-date">
                  <time dateTime={user.createdAt}>{formatAdminDateTime(user.createdAt)}</time>
                </td>
                <td data-label="Thao tác" className="admin-table-col-actions">
                  <div className="admin-row-actions">
                    <button
                      type="button"
                      className="admin-btn admin-btn-ghost"
                      onClick={() => onEdit(user)}
                    >
                      Sửa
                    </button>
                    <button
                      type="button"
                      className={
                        user.active ? 'admin-btn admin-btn-warning' : 'admin-btn admin-btn-success'
                      }
                      disabled={!accessToken || busyId === user.id || user.id === currentAdminId}
                      onClick={() => void handleToggleActive(user)}
                    >
                      {busyId === user.id
                        ? 'Đang xử lý…'
                        : user.active
                          ? 'Ngưng hoạt động'
                          : 'Kích hoạt'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
