import { Link, Outlet } from 'react-router-dom';
import { useAuth } from '../../features/auth/hooks/useAuth';

export function AppShell() {
  const { user, isAuthenticated, isInitializing, logout } = useAuth();

  return (
    <div className="app-shell">
      <header className="app-header">
        <Link to="/" className="brand">
          LMS
        </Link>
        <nav className="app-nav">
          {isInitializing ? (
            <span className="muted">…</span>
          ) : isAuthenticated && user ? (
            <>
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
