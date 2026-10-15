import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { resolveRedirectTarget } from '../utils/redirect';

/**
 * Redirects authenticated users away from login/register to the intended
 * destination (router state `from`), or home. Doing this here avoids a race
 * between this guard and a navigate() call in the form.
 */
export function GuestRoute() {
  const { isAuthenticated, isInitializing } = useAuth();
  const location = useLocation();

  if (isInitializing) {
    return <p className="page-status">Loading session…</p>;
  }

  if (isAuthenticated) {
    return <Navigate to={resolveRedirectTarget(location.state)} replace />;
  }

  return <Outlet />;
}
