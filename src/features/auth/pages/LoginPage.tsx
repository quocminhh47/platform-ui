import { Link, useLocation } from 'react-router-dom';
import { LoginForm } from '../components/LoginForm';

export function LoginPage() {
  const location = useLocation();

  return (
    <section className="auth-page">
      <h1>Sign in</h1>
      <p className="auth-lead">Use your LMS account to continue.</p>
      {/* Redirect after success is handled by GuestRoute. */}
      <LoginForm />
      <p className="auth-switch">
        No account yet?{' '}
        <Link to="/register" state={location.state}>
          Register
        </Link>
      </p>
    </section>
  );
}
