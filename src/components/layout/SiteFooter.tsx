import { Link } from 'react-router-dom';
import { SITE_BRAND } from '../../config/site-brand';
import { useAuth } from '../../features/auth/hooks/useAuth';
import { BrandMark } from './BrandMark';

export function SiteFooter() {
  const { isAuthenticated, isInitializing } = useAuth();
  const showGuestLinks = !isInitializing && !isAuthenticated;
  return (
    <footer className="site-footer landing-footer" aria-label="Footer">
      <div className="landing-footer-inner">
        <div className="landing-footer-grid">
          <div className="landing-footer-brand">
            <div className="landing-footer-logo">
              <BrandMark />
              <span>{SITE_BRAND.productName}</span>
            </div>
            <ul className="landing-footer-contact">
              <li>
                <strong>{SITE_BRAND.shortName}</strong>
              </li>
              <li>Địa chỉ liên hệ sẽ được cập nhật trên website chính thức của trung tâm.</li>
              <li>
                Email:{' '}
                <a href="mailto:lienhe@example.com">lienhe@example.com</a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="landing-footer-heading">Khám phá</h3>
            <ul className="landing-footer-links">
              <li><Link to="/courses">Danh mục khóa học</Link></li>
              {showGuestLinks ? (
                <>
                  <li><Link to="/register">Đăng ký học viên</Link></li>
                  <li><Link to="/login">Đăng nhập</Link></li>
                </>
              ) : (
                <li><Link to="/dashboard">Trang cá nhân</Link></li>
              )}
            </ul>
          </div>

          <div>
            <h3 className="landing-footer-heading">Hỗ trợ</h3>
            <ul className="landing-footer-links">
              <li><a href="/#faq">Câu hỏi thường gặp</a></li>
              <li><span className="muted">Chính sách bảo mật (đang cập nhật)</span></li>
              <li><span className="muted">Điều khoản sử dụng (đang cập nhật)</span></li>
            </ul>
          </div>
        </div>

        <nav className="visually-hidden" aria-label="Footer">
          <Link to="/">Trang chủ</Link>
          <Link to="/courses">Khóa học</Link>
        </nav>

        <div className="landing-footer-bottom">
          <p>© 2026 {SITE_BRAND.shortName}. Bảo lưu mọi quyền.</p>
          <p className="muted">Nền tảng học trực tuyến — nội dung khóa học do trung tâm quản lý.</p>
        </div>
      </div>
    </footer>
  );
}
