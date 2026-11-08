import { Link, useLocation } from 'react-router-dom';
import { UI_COPY } from '../../../ui/ui-copy';
import { LoginForm } from '../components/LoginForm';
import { LoginIllustration } from '../components/LoginIllustration';

export function LoginPage() {
  const location = useLocation();

  return (
    <section className="login-page">
      <div className="login-hero">
        <LoginIllustration />
        <p className="login-hero-title">Nền tảng Học Tiếng Trung &amp; Luyện thi HSK Toàn diện</p>
        <p className="login-hero-sub">
          Lộ trình từ HSK 1 đến HSK 6 · Giao tiếp phản xạ &amp; Phát âm chuẩn Pinyin
        </p>
      </div>

      <div className="login-card">
        <span className="login-brand">LMS360</span>
        <p className="login-tagline">Hệ thống học tiếng Trung &amp; luyện thi HSK trực tuyến</p>
        <h1>{UI_COPY.signIn}</h1>
        <p className="auth-lead">Dùng email hoặc số điện thoại để tiếp tục.</p>
        <LoginForm />
        <p className="auth-switch">
          Chưa có tài khoản?{' '}
          <Link to="/register" state={location.state}>
            {UI_COPY.register}
          </Link>
        </p>
      </div>
    </section>
  );
}
