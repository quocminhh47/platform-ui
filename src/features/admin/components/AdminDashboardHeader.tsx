import type { User } from '../../auth/types/auth.types';

type AdminDashboardHeaderProps = {
  user: User;
};

export function AdminDashboardHeader({ user }: AdminDashboardHeaderProps) {
  return (
    <header className="dashboard-header">
      <div>
        <p className="dashboard-kicker">Quản trị</p>
        <p className="dashboard-header-name">{user.fullName}</p>
      </div>
      <p className="muted dashboard-header-email">{user.email}</p>
    </header>
  );
}
