import { Link, useLocation } from 'react-router-dom';
import { UI_COPY } from '../../../ui/ui-copy';
import { RegisterForm } from '../components/RegisterForm';

export function RegisterPage() {
  const location = useLocation();

  return (
    <section className="auth-page auth-page-card">
      <h1>{UI_COPY.createAccount}</h1>
      <p className="auth-lead">Đăng ký công khai tạo tài khoản học viên.</p>
      <RegisterForm />
      <p className="auth-switch">
        Đã có tài khoản?{' '}
        <Link to="/login" state={location.state}>
          {UI_COPY.signIn}
        </Link>
      </p>
    </section>
  );
}
