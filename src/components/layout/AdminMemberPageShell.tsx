import type { ReactNode } from 'react';
import { DashboardLayout } from '../../features/dashboard/components/DashboardLayout';
import { DashboardSidebar } from '../../features/dashboard/components/DashboardSidebar';
import { useAuth } from '../../features/auth/hooks/useAuth';

type AdminMemberPageShellProps = {
  children: ReactNode;
};

/** Wraps public catalog/detail pages with the admin workspace sidebar for ADMIN users only. */
export function AdminMemberPageShell({ children }: AdminMemberPageShellProps) {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  if (!isAdmin) {
    return <>{children}</>;
  }

  return (
    <DashboardLayout sidebar={<DashboardSidebar />}>
      {children}
    </DashboardLayout>
  );
}
