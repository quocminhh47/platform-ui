import type { User } from '../../auth/types/auth.types';

type DashboardHeaderProps = {
  user: User;
};

export function DashboardHeader({ user }: DashboardHeaderProps) {
  return (
    <header className="dashboard-header">
      <div>
        <p className="dashboard-kicker">Student</p>
        <p className="dashboard-header-name">{user.fullName}</p>
      </div>
      <p className="muted dashboard-header-email">{user.email}</p>
    </header>
  );
}
