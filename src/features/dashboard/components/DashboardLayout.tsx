import type { ReactNode } from 'react';

type DashboardLayoutProps = {
  sidebar: ReactNode;
  header?: ReactNode;
  children: ReactNode;
};

export function DashboardLayout({ sidebar, header, children }: DashboardLayoutProps) {
  return (
    <div className="dashboard-shell admin-workspace-shell">
      {sidebar}
      <div className="dashboard-main">
        {header ?? null}
        <div className="dashboard-content admin-workspace-content">{children}</div>
      </div>
    </div>
  );
}
