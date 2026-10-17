import type { User } from '../../auth/types/auth.types';

type AdminWorkspaceMetaProps = {
  user: User;
};

export function AdminWorkspaceMeta({ user }: AdminWorkspaceMetaProps) {
  return (
    <p className="admin-workspace-meta">
      Quản trị viên:{' '}
      <span className="admin-workspace-meta-strong">{user.fullName}</span>
      <span className="admin-workspace-meta-muted"> ({user.email})</span>
    </p>
  );
}
