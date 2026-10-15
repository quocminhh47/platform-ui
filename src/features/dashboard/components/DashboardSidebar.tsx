import { NavLink } from 'react-router-dom';
import { useAuth } from '../../auth/hooks/useAuth';

export function DashboardSidebar() {
  const { logout } = useAuth();

  return (
    <aside className="dashboard-sidebar">
      <p className="sidebar-label">Learn</p>
      <nav className="sidebar-nav" aria-label="Dashboard">
        <NavLink to="/dashboard" end>
          Dashboard
        </NavLink>
        <NavLink to="/courses">Explore courses</NavLink>
      </nav>
      <button type="button" className="sidebar-sign-out" onClick={logout}>
        Log out
      </button>
    </aside>
  );
}
