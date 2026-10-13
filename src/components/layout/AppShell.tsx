import { Link, NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../../features/auth/hooks/useAuth';

export function AppShell() {
  const { user, isAuthenticated, isInitializing, logout } = useAuth();

  return (
    <div className="app-shell">
      <header className="app-header">
        <Link to="/" className="brand">
          LMS
        </Link>
        <nav className="site-nav" aria-label="Main">
          <NavLink to="/" end>
            Home
          </NavLink>
          <NavLink to="/courses">Explore courses</NavLink>
        </nav>
        <nav className="app-nav" aria-label="Account">
          {isInitializing ? (
            <span className="muted">…</span>
          ) : isAuthenticated && user ? (
            <>
              <Link to="/dashboard">Dashboard</Link>
              <span className="muted">
                {user.fullName} ({user.role})
              </span>
              <button type="button" className="link-button" onClick={logout}>
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link to="/login">Sign in</Link>
              <Link to="/register">Register</Link>
            </>
          )}
        </nav>
      </header>
      <main className="app-main">
        <Outlet />
      </main>
    </div>
  );
}
