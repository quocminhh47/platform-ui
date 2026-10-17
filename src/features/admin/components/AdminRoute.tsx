import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../auth/hooks/useAuth';

/**
 * ADMIN-only UI gate. Must be nested under {@link ProtectedRoute}.
 * Backend authorization remains authoritative.
 */
export function AdminRoute() {
  const { user, isInitializing } = useAuth();

  if (isInitializing) {
    return <p className="page-status">Loading session…</p>;
  }

  if (user?.role !== 'ADMIN') {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
