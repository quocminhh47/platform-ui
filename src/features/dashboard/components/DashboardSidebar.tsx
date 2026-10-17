import { NavLink } from 'react-router-dom';
import { useAuth } from '../../auth/hooks/useAuth';

export function DashboardSidebar() {
  const { user, logout } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  return (
    <aside className="dashboard-sidebar">
      <p className="sidebar-label">Learn</p>
      <nav className="sidebar-nav" aria-label="Dashboard">
        <NavLink to="/dashboard" end>
          Dashboard
        </NavLink>
        <NavLink to="/my-courses">My courses</NavLink>
        <NavLink to="/courses">Explore courses</NavLink>
      </nav>
      {isAdmin ? (
        <>
          <p className="sidebar-label">Quản trị</p>
          <nav className="sidebar-nav" aria-label="Quản trị">
            <NavLink to="/admin/courses">Quản lý khóa học</NavLink>
          </nav>
        </>
      ) : null}
      <button type="button" className="sidebar-sign-out" onClick={logout}>
        Log out
      </button>
    </aside>
  );
}
