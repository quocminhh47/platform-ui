import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation, useSearchParams } from 'react-router-dom';
import { SITE_BRAND } from '../../config/site-brand';
import { useAuth } from '../../features/auth/hooks/useAuth';
import { BrandMark } from './BrandMark';

const SEARCH_PATHS = new Set(['/', '/courses']);

export function SiteHeader() {
  const { user, isAuthenticated, isInitializing, logout } = useAuth();
  const location = useLocation();
  const [params, setParams] = useSearchParams();
  const [mobileOpen, setMobileOpen] = useState(false);
  const query = params.get('q') ?? '';
  const searchEnabled = SEARCH_PATHS.has(location.pathname);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  function onSearch(value: string) {
    if (!searchEnabled) {
      return;
    }
    const next = new URLSearchParams(params);
    if (value.trim()) {
      next.set('q', value);
    } else {
      next.delete('q');
    }
    setParams(next, { replace: true });
  }

  return (
    <header className="site-header">
      <div className="site-header-inner">
        <Link className="site-brand" to="/">
          <BrandMark />
          <span className="site-brand-text">
            <span className="site-brand-title">{SITE_BRAND.shortName}</span>
            <span className="site-brand-sub">{SITE_BRAND.tagline}</span>
          </span>
        </Link>

        <nav className="site-header-nav" aria-label="Chính">
          <NavLink to="/" end className={navClass}>
            Trang chủ
          </NavLink>
          <NavLink to="/courses" className={navClass}>
            Khóa học
          </NavLink>
          <a className="site-header-nav-link" href="/#why-choose">
            Vì sao chọn chúng tôi
          </a>
          <a className="site-header-nav-link" href="/#faq">
            FAQ
          </a>
        </nav>

        <div className="site-header-tools">
          {searchEnabled ? (
            <form
              className="site-header-search"
              role="search"
              onSubmit={(event) => event.preventDefault()}
            >
              <label className="visually-hidden" htmlFor="site-course-search">
                Tìm kiếm học liệu
              </label>
              <input
                id="site-course-search"
                type="search"
                value={query}
                placeholder="Tìm khóa học…"
                onChange={(event) => onSearch(event.target.value)}
              />
            </form>
          ) : null}

          <nav className="site-header-account" aria-label="Tài khoản">
            {isInitializing ? (
              <span className="site-header-muted">…</span>
            ) : isAuthenticated && user ? (
              <>
                <Link className="site-header-link" to="/dashboard">
                  Cá nhân
                </Link>
                <Link className="site-header-link" to="/my-courses">
                  My courses
                </Link>
                <Link className="site-header-link" to="/account">
                  Hồ sơ
                </Link>
                <span className="site-header-user">{user.fullName}</span>
                <button type="button" className="site-header-sign-out" onClick={logout}>
                  Đăng xuất
                </button>
              </>
            ) : (
              <>
                <Link className="site-header-register" to="/register">
                  Đăng ký
                </Link>
                <Link className="site-header-login" to="/login">
                  Đăng nhập
                </Link>
              </>
            )}
          </nav>

          <button
            type="button"
            className="site-header-menu-toggle"
            aria-expanded={mobileOpen}
            aria-controls="site-mobile-nav"
            onClick={() => setMobileOpen((open) => !open)}
          >
            <span className="visually-hidden">Menu</span>
            <span aria-hidden="true" className="site-header-menu-icon" />
          </button>
        </div>
      </div>

      {mobileOpen ? (
        <nav id="site-mobile-nav" className="site-header-mobile" aria-label="Menu di động">
          <NavLink to="/" end className={navClass} onClick={() => setMobileOpen(false)}>
            Trang chủ
          </NavLink>
          <NavLink to="/courses" className={navClass} onClick={() => setMobileOpen(false)}>
            Khóa học
          </NavLink>
          <a className="site-header-nav-link" href="/#why-choose" onClick={() => setMobileOpen(false)}>
            Vì sao chọn chúng tôi
          </a>
          <a className="site-header-nav-link" href="/#faq" onClick={() => setMobileOpen(false)}>
            FAQ
          </a>
          {!isAuthenticated ? (
            <>
              <Link to="/register" onClick={() => setMobileOpen(false)}>Đăng ký</Link>
              <Link to="/login" onClick={() => setMobileOpen(false)}>Đăng nhập</Link>
            </>
          ) : (
            <Link to="/dashboard" onClick={() => setMobileOpen(false)}>Cá nhân</Link>
          )}
        </nav>
      ) : null}
    </header>
  );
}

function navClass({ isActive }: { isActive: boolean }) {
  return isActive ? 'site-header-nav-link is-active' : 'site-header-nav-link';
}
