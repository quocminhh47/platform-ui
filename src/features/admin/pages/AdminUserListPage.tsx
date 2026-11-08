import { useEffect, useRef, useState } from 'react';
import { Breadcrumb } from '../../../components/common/Breadcrumb';
import { PaginationControls } from '../../../components/common/PaginationControls';
import { breadcrumbAdminUsers, breadcrumbHome } from '../../../navigation/breadcrumb-trail';
import { useToast } from '../../../components/feedback/useToast';
import { useAuth } from '../../auth/hooks/useAuth';
import type { User } from '../../auth/types/auth.types';
import { createUser, updateUser } from '../api/admin-users.api';
import { AdminUserForm } from '../components/AdminUserForm';
import { AdminUserTable } from '../components/AdminUserTable';
import { AdminUsersToolbar } from '../components/AdminUsersToolbar';
import { AdminWorkspaceMeta } from '../components/AdminWorkspaceMeta';
import { DashboardLayout } from '../../dashboard/components/DashboardLayout';
import { DashboardSidebar } from '../../dashboard/components/DashboardSidebar';
import { useAdminUserMetrics } from '../hooks/useAdminUserMetrics';
import { useAdminUsers } from '../hooks/useAdminUsers';
import {
  ADMIN_USER_ACTIVATE_SUCCESS,
  ADMIN_USER_CREATE_SUCCESS,
  ADMIN_USER_DEACTIVATE_SUCCESS,
  ADMIN_USER_UPDATE_SUCCESS,
  adminUserSaveMessage,
} from '../utils/admin-user-messages';
import type {
  AdminUserRoleFilter,
  AdminUserSort,
  AdminUserStatusFilter,
} from '../utils/adminUserListFilters';
import {
  emptyAdminUserCreateFormValues,
  userToEditFormValues,
  type AdminUserCreateFormValues,
  type AdminUserEditFormValues,
} from '../validation/admin-user-form.validation';

export function AdminUserListPage() {
  const { user, accessToken } = useAuth();
  const toast = useToast();
  const metricsState = useAdminUserMetrics(Boolean(user?.role === 'ADMIN'));
  const [query, setQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<AdminUserRoleFilter>('all');
  const [statusFilter, setStatusFilter] = useState<AdminUserStatusFilter>('all');
  const [sort, setSort] = useState<AdminUserSort>('newest');
  const [page, setPage] = useState(0);

  useEffect(() => {
    setPage(0);
  }, [query, roleFilter, statusFilter, sort]);

  const usersState = useAdminUsers(Boolean(user?.role === 'ADMIN'), {
    q: query,
    role: roleFilter,
    status: statusFilter,
    sort,
    page,
    size: 20,
  });
  const [createOpen, setCreateOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const submitInFlightRef = useRef(false);

  const pageData = usersState.page;
  const visibleUsers = pageData?.content ?? [];
  const totalCount = metricsState.metrics?.total ?? pageData?.totalElements ?? 0;
  const activeCount = metricsState.metrics?.active ?? 0;
  const inactiveCount = metricsState.metrics?.inactive ?? 0;

  if (!user) {
    return null;
  }

  const hasUsers = totalCount > 0;
  const filteredEmpty = hasUsers && !usersState.loading && visibleUsers.length === 0;

  function closeForms() {
    setCreateOpen(false);
    setEditingUser(null);
    setFormError(null);
  }

  function buildUpdateBody(values: AdminUserEditFormValues) {
    return {
      fullName: values.fullName.trim(),
      phone: values.phone.trim() ? values.phone.trim() : null,
      dateOfBirth: values.dateOfBirth.trim() ? values.dateOfBirth.trim() : null,
      avatarUrl: values.avatarUrl.trim() ? values.avatarUrl.trim() : null,
      active: values.active,
    };
  }

  async function handleCreateSubmit(values: AdminUserCreateFormValues) {
    if (!accessToken || submitting || submitInFlightRef.current) {
      return;
    }
    submitInFlightRef.current = true;
    setSubmitting(true);
    setFormError(null);
    try {
      await createUser(accessToken, {
        email: values.email.trim(),
        password: values.password,
        fullName: values.fullName.trim(),
        role: values.role,
        phone: values.phone.trim() ? values.phone.trim() : null,
        dateOfBirth: values.dateOfBirth.trim() ? values.dateOfBirth.trim() : null,
        avatarUrl: values.avatarUrl.trim() ? values.avatarUrl.trim() : null,
      });
      toast.success(ADMIN_USER_CREATE_SUCCESS);
      closeForms();
      await usersState.refresh();
      metricsState.reload();
    } catch (cause: unknown) {
      setFormError(adminUserSaveMessage(cause));
    } finally {
      setSubmitting(false);
      submitInFlightRef.current = false;
    }
  }

  async function handleEditSubmit(values: AdminUserEditFormValues) {
    if (!accessToken || !editingUser || submitting || submitInFlightRef.current) {
      return;
    }
    submitInFlightRef.current = true;
    setSubmitting(true);
    setFormError(null);
    try {
      await updateUser(accessToken, editingUser.id, buildUpdateBody(values));
      toast.success(ADMIN_USER_UPDATE_SUCCESS);
      closeForms();
      await usersState.refresh();
      metricsState.reload();
    } catch (cause: unknown) {
      setFormError(adminUserSaveMessage(cause));
    } finally {
      setSubmitting(false);
      submitInFlightRef.current = false;
    }
  }

  async function handleToggleActive(target: User) {
    if (!accessToken) {
      return;
    }
    try {
      await updateUser(accessToken, target.id, { active: !target.active });
      toast.success(target.active ? ADMIN_USER_DEACTIVATE_SUCCESS : ADMIN_USER_ACTIVATE_SUCCESS);
      await usersState.refresh();
      metricsState.reload();
      if (editingUser?.id === target.id) {
        setEditingUser(null);
      }
    } catch (cause: unknown) {
      toast.error(adminUserSaveMessage(cause));
      throw cause;
    }
  }

  return (
    <DashboardLayout sidebar={<DashboardSidebar />}>
      <section className="admin-users admin-workspace-page" aria-labelledby="admin-users-heading">
        <div className="admin-workspace-top">
          <Breadcrumb items={[breadcrumbHome(), breadcrumbAdminUsers()]} />
          <AdminWorkspaceMeta user={user} />
        </div>

        {usersState.loading ? (
          <p className="page-status">Đang tải danh sách người dùng…</p>
        ) : null}

        {!usersState.loading && usersState.error ? (
          <div className="section-error" role="alert">
            <p>{usersState.error}</p>
            <button type="button" className="admin-btn admin-btn-secondary" onClick={usersState.reload}>
              Thử lại
            </button>
          </div>
        ) : null}

        {!usersState.loading && !usersState.error ? (
          <>
            <AdminUsersToolbar
              totalCount={totalCount}
              visibleCount={pageData?.totalElements ?? visibleUsers.length}
              activeCount={activeCount}
              inactiveCount={inactiveCount}
              query={query}
              roleFilter={roleFilter}
              statusFilter={statusFilter}
              sort={sort}
              onQueryChange={setQuery}
              onRoleChange={setRoleFilter}
              onStatusChange={setStatusFilter}
              onSortChange={setSort}
              onCreateClick={() => {
                setEditingUser(null);
                setFormError(null);
                setCreateOpen(true);
              }}
            />

            {createOpen ? (
              <AdminUserForm
                key="user-create"
                mode="create"
                initialValues={emptyAdminUserCreateFormValues()}
                formError={formError}
                submitting={submitting}
                onCancel={closeForms}
                onSubmit={handleCreateSubmit}
              />
            ) : null}

            {editingUser ? (
              <AdminUserForm
                key={`user-edit-${editingUser.id}`}
                mode="edit"
                user={editingUser}
                initialValues={userToEditFormValues(editingUser)}
                formError={formError}
                submitting={submitting}
                disableActiveToggle={editingUser.id === user.id}
                onCancel={closeForms}
                onSubmit={handleEditSubmit}
              />
            ) : null}

            {!hasUsers ? (
              <div className="admin-empty-panel">
                <p className="empty-state-title">Chưa có người dùng nào</p>
                <p className="muted">Tạo tài khoản đầu tiên hoặc kiểm tra kết nối API.</p>
              </div>
            ) : null}

            {hasUsers && filteredEmpty ? (
              <div className="admin-empty-panel admin-empty-panel-compact">
                <p className="empty-state-title">Không có người dùng phù hợp</p>
                <p className="muted">Thử đổi từ khóa tìm kiếm hoặc bộ lọc.</p>
                <button
                  type="button"
                  className="admin-btn admin-btn-secondary"
                  onClick={() => {
                    setQuery('');
                    setRoleFilter('all');
                    setStatusFilter('all');
                  }}
                >
                  Xóa bộ lọc
                </button>
              </div>
            ) : null}

            {hasUsers && visibleUsers.length > 0 ? (
              <>
                <AdminUserTable
                  users={visibleUsers}
                  currentAdminId={user.id}
                  accessToken={accessToken}
                  onEdit={(target) => {
                    setCreateOpen(false);
                    setFormError(null);
                    setEditingUser(target);
                  }}
                  onToggleActive={handleToggleActive}
                  onToggleError={(message) => toast.error(message)}
                />
                {pageData ? (
                  <PaginationControls
                    page={pageData.page}
                    totalPages={pageData.totalPages}
                    totalElements={pageData.totalElements}
                    disabled={usersState.loading}
                    onPageChange={setPage}
                    label="Trang người dùng"
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
