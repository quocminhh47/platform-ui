import { useEffect, useState, type ReactNode } from 'react';
import { Link, NavLink, Outlet, useLocation, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../features/auth/hooks/useAuth';

const BROWSE_PATHS = new Set(['/', '/courses']);

export function AppShell() {
  const location = useLocation();
  if (BROWSE_PATHS.has(location.pathname)) {
    return <BrowseShell />;
  }
  return <DefaultShell />;
}

function BrowseShell() {
  const { user, isAuthenticated, isInitializing, logout } = useAuth();
  const [params, setParams] = useSearchParams();
  const query = params.get('q') ?? '';
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    function onScroll() {
      setShowTop(window.scrollY > 240);
    }
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  function onSearch(value: string) {
    const next = new URLSearchParams(params);
    if (value.trim()) {
      next.set('q', value);
    } else {
      next.delete('q');
    }
    setParams(next, { replace: true });
  }

  return (
    <div className="home-shell">
      <header className="home-header">
        <Link className="home-brand" to="/">
          <span className="home-brand-mark">
            LMS<span>360</span>
          </span>
          <span className="home-brand-caption">
            <span>Hệ thống quản lý</span>
            <span>Học tập trực tuyến</span>
          </span>
        </Link>
        <form className="home-search" role="search" onSubmit={(event) => event.preventDefault()}>
          <label className="visually-hidden" htmlFor="course-search">
            Tìm kiếm học liệu
          </label>
          <input
            id="course-search"
            type="search"
            value={query}
            placeholder="Tìm kiếm học liệu tiếng Trung..."
            aria-describedby="search-note"
            onChange={(event) => onSearch(event.target.value)}
          />
          <p id="search-note" className="visually-hidden">
            Tìm trong tiêu đề và mô tả của các khóa học đã tải. Máy chủ chưa hỗ trợ tìm kiếm.
          </p>
        </form>
        <div className="home-header-actions">
          <button
            type="button"
            className="home-ai"
            disabled
            aria-describedby="ai-unavailable"
            title="Tính năng tạo học liệu AI chưa khả dụng"
          >
            Tạo học liệu AI
          </button>
          <p id="ai-unavailable" className="visually-hidden">
            Chưa khả dụng. Ứng dụng chưa tạo học liệu bằng AI.
          </p>
          <nav className="home-account" aria-label="Tài khoản">
            {isInitializing ? (
              <span className="muted">…</span>
            ) : isAuthenticated && user ? (
              <>
                <span className="home-user-name">{user.fullName}</span>
                <button className="home-sign-out" type="button" onClick={logout}>
                  Đăng xuất
                </button>
              </>
            ) : (
              <>
                <Link className="home-register" to="/register">
                  Đăng ký
                </Link>
                <Link className="home-sign-in" to="/login">
                  Đăng nhập
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>
      <div className="home-frame">
        <aside className="home-sidebar">
          <nav aria-label="Chính">
            <NavLink to="/" end>
              <HomeIcon />
              <span>Trang chủ</span>
            </NavLink>
            <NavLink to="/courses">
              <CoursesIcon />
              <span>Khóa học</span>
            </NavLink>
            {isAuthenticated ? (
              <NavLink to="/dashboard">
                <PersonIcon />
                <span>Cá nhân</span>
              </NavLink>
            ) : (
              <UnavailableItem label="Cá nhân" title="Đăng nhập để mở trang cá nhân">
                <PersonIcon />
              </UnavailableItem>
            )}
            <UnavailableItem label="Bách khoa">
              <GlobeIcon />
            </UnavailableItem>
            <UnavailableItem label="Tin tức">
              <NewsIcon />
            </UnavailableItem>
            <UnavailableItem label="Ưu đãi học bổng">
              <GiftIcon />
            </UnavailableItem>
            <UnavailableItem label="Tuyển dụng">
              <BriefcaseIcon />
            </UnavailableItem>
            <UnavailableItem label="Hướng dẫn sử dụng">
              <GuideIcon />
            </UnavailableItem>
            <UnavailableItem label="Liên hệ">
              <PhoneIcon />
            </UnavailableItem>
          </nav>
        </aside>
        <main className="home-main">
          <Outlet />
        </main>
      </div>
      {showTop ? (
        <button
          type="button"
          className="home-scroll-top"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          Lên đầu trang
        </button>
      ) : null}
    </div>
  );
}

function UnavailableItem({
  label,
  title = 'Chưa có trang này',
  children,
}: {
  label: string;
  title?: string;
  children: ReactNode;
}) {
  return (
    <button type="button" className="home-nav-disabled" disabled title={title}>
      {children}
      <span>{label}</span>
    </button>
  );
}

function DefaultShell() {
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

function HomeIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="home-nav-icon">
      <path fill="currentColor" d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
    </svg>
  );
}

function CoursesIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="home-nav-icon" fill="none">
      <path
        d="M4 6h16M4 12h16M4 18h10"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="2"
      />
    </svg>
  );
}

function PersonIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="home-nav-icon" fill="none">
      <path
        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
        stroke="currentColor"
        strokeWidth="2"
      />
    </svg>
  );
}

function GlobeIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="home-nav-icon" fill="none">
      <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="2" />
      <path d="M4 12h16M12 4c2.5 2.8 2.5 13.2 0 16M12 4c-2.5 2.8-2.5 13.2 0 16" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

function NewsIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="home-nav-icon" fill="none">
      <path d="M6 8h8M6 12h8M6 16h5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M4 5h12a2 2 0 012 2v12H6a2 2 0 01-2-2V5z" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

function GiftIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="home-nav-icon" fill="none">
      <path d="M4 12h16v8H4v-8zM3 8h18v4H3V8zM12 8v12" stroke="currentColor" strokeWidth="2" />
      <path d="M12 8c-2-3-6-2-6 1s4 1 6-1zm0 0c2-3 6-2 6 1s-4 1-6-1z" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

function BriefcaseIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="home-nav-icon" fill="none">
      <rect x="3" y="8" width="18" height="12" rx="2" stroke="currentColor" strokeWidth="2" />
      <path d="M8 8V6a2 2 0 012-2h4a2 2 0 012 2v2M3 13h18" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

function GuideIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="home-nav-icon" fill="none">
      <path d="M7 4h9a3 3 0 013 3v13H8a3 3 0 01-3-3V6a2 2 0 012-2z" stroke="currentColor" strokeWidth="2" />
      <path d="M7 4v13a3 3 0 003 3" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="home-nav-icon" fill="none">
      <path
        d="M8 4h3l1 4-2 1a12 12 0 006 6l1-2 4 1v3a2 2 0 01-2 2A16 16 0 016 6a2 2 0 012-2z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}
