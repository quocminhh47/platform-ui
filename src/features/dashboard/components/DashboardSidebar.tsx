import { NavLink } from 'react-router-dom';
import { UI_COPY } from '../../../ui/ui-copy';
import { useAuth } from '../../auth/hooks/useAuth';

type DashboardSidebarProps = {
  courseCount?: number;
};

export function DashboardSidebar({ courseCount }: DashboardSidebarProps) {
  const { user, logout } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  return (
    <aside className="dashboard-sidebar admin-workspace-sidebar">
      <p className="sidebar-label">{UI_COPY.sidebarLearn}</p>
      <nav className="sidebar-nav" aria-label={UI_COPY.navDashboard}>
        <NavLink to="/dashboard" end>
          {UI_COPY.navDashboard}
        </NavLink>
        <NavLink to="/my-courses">{UI_COPY.navMyCourses}</NavLink>
        <NavLink to="/articles" end>
          Bài viết
        </NavLink>
        <NavLink to="/my-articles">Bài viết của tôi</NavLink>
        <NavLink to="/courses">{UI_COPY.navExploreCourses}</NavLink>
      </nav>
      {isAdmin ? (
        <>
          <p className="sidebar-label">Quản trị</p>
          <nav className="sidebar-nav" aria-label="Quản trị">
            <NavLink to="/admin" end>
              Tổng quan quản trị
            </NavLink>
            <NavLink to="/admin/users">Quản lý người dùng</NavLink>
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
        {UI_COPY.navLogOut}
      </button>
    </aside>
  );
}
