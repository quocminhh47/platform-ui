import type { ReactNode } from 'react';
import { DashboardLayout } from '../../features/dashboard/components/DashboardLayout';
import { DashboardSidebar } from '../../features/dashboard/components/DashboardSidebar';
import { useAuth } from '../../features/auth/hooks/useAuth';

type MemberPageShellProps = {
  children: ReactNode;
};

/** Wraps public pages with the member sidebar when the user is signed in. */
export function MemberPageShell({ children }: MemberPageShellProps) {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user) {
    return <>{children}</>;
  }

  return <DashboardLayout sidebar={<DashboardSidebar />}>{children}</DashboardLayout>;
}
