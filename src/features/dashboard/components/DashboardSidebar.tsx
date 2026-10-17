import { NavLink } from 'react-router-dom';
import { useAuth } from '../../auth/hooks/useAuth';

type DashboardSidebarProps = {
  courseCount?: number;
};

export function DashboardSidebar({ courseCount }: DashboardSidebarProps) {
  const { user, logout } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  return (
    <aside className="dashboard-sidebar admin-workspace-sidebar">
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
            <NavLink to="/admin/courses" className="admin-sidebar-courses-link">
              <span>Quản lý khóa học</span>
              {typeof courseCount === 'number' ? (
                <span className="admin-sidebar-count">{courseCount}</span>
              ) : null}
            </NavLink>
          </nav>
        </>
      ) : null}
      <button type="button" className="sidebar-sign-out admin-sidebar-sign-out" onClick={logout}>
        Log out
      </button>
    </aside>
  );
}
