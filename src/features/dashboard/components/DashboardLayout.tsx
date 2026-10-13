import type { ReactNode } from 'react';

type DashboardLayoutProps = {
  sidebar: ReactNode;
  header: ReactNode;
  children: ReactNode;
};

export function DashboardLayout({ sidebar, header, children }: DashboardLayoutProps) {
  return (
    <div className="dashboard-shell">
      {sidebar}
      <div className="dashboard-main">
        {header}
        <div className="dashboard-content">{children}</div>
      </div>
    </div>
  );
}
